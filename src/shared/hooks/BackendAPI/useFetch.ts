import { useRecoilValue } from 'recoil';

import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { throwHttpError } from 'shared/hooks/BackendAPI/config';

import { authDataState, AuthDataState } from '../../../state/authDataAtom';
import { getClusterConfig } from '../../../state/utils/getBackendInfo';
import { ActiveClusterState, clusterState } from '../../../state/clusterAtom';
import { ssoDataState, SsoDataState } from 'state/ssoDataAtom';
import { checkForTokenExpiration } from './checkForTokenExpiration';

export type FetchFn = ({
  relativeUrl,
  abortController,
  init,
}: {
  relativeUrl: string;
  init?: any;
  abortController?: AbortController;
}) => Promise<Response>;

export const createFetchFn = ({
  authData,
  cluster,
  ssoData,
}: {
  authData: AuthDataState;
  cluster: ActiveClusterState;
  ssoData: SsoDataState;
}): FetchFn => async ({
  relativeUrl,
  abortController,
  init,
}: {
  relativeUrl: string;
  init?: any;
  abortController?: AbortController;
}) => {
  const token = authData && 'token' in authData ? authData.token : undefined;
  checkForTokenExpiration(token);
  checkForTokenExpiration(ssoData?.id_token);

  init = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...createHeaders(authData, cluster, ssoData),
    },
    signal: abortController?.signal,
  };
  const { backendAddress } = getClusterConfig();

  try {
    const response = await fetch(backendAddress + relativeUrl, init);
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
  const ssoData = useRecoilValue(ssoDataState);

  const fetchFn = createFetchFn({
    authData,
    cluster,
    ssoData,
  });
  return fetchFn;
};
