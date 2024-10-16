import { useRecoilValue } from 'recoil';

import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { throwHttpError } from 'shared/hooks/BackendAPI/config';

import { authDataState, AuthDataState } from '../../../state/authDataAtom';
import { getClusterConfig } from '../../../state/utils/getBackendInfo';
import { clusterState, ActiveClusterState } from '../../../state/clusterAtom';

export type FetchFn = ({
  customUIUrl,
  relativeUrl,
  abortController,
  init,
}: {
  customUIUrl?: any;
  relativeUrl: string;
  init?: any;
  abortController?: AbortController;
}) => Promise<Response>;

export const createFetchFn = ({
  authData,
  cluster,
}: {
  authData: AuthDataState;
  cluster: ActiveClusterState;
}): FetchFn => async ({
  customUIUrl,
  relativeUrl,
  abortController,
  init,
}: {
  customUIUrl?: any;
  relativeUrl: string;
  init?: any;
  abortController?: AbortController;
}) => {
  init = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...createHeaders(authData, cluster),
    },
    signal: abortController?.signal,
  };
  const { backendAddress, customUIBackendAddress } = getClusterConfig();

  let preparedCustomUIUrl =
    customUIUrl?.url && customUIUrl?.host
      ? customUIBackendAddress +
        customUIUrl?.url +
        '?customUIUrl=' +
        customUIUrl?.host
      : '';
  if (preparedCustomUIUrl) {
    preparedCustomUIUrl = preparedCustomUIUrl + '&' + customUIUrl.query;
  }

  try {
    const response = await fetch(
      preparedCustomUIUrl ? preparedCustomUIUrl : backendAddress + relativeUrl,
      init,
    );
    if (response.ok) {
      return response;
    } else {
      throw await throwHttpError(response);
    }
  } catch (e) {
    console.error(`Fetch failed (${relativeUrl}): ${e}`);
    throw e;
  }
};

export const useFetch = () => {
  const authData = useRecoilValue(authDataState);
  const cluster = useRecoilValue(clusterState);

  const fetchFn = createFetchFn({
    authData,
    cluster,
  });
  return fetchFn;
};
