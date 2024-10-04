import { useRecoilValue } from 'recoil';

import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { throwHttpError } from 'shared/hooks/BackendAPI/config';

import { authDataState, AuthDataState } from '../../../state/authDataAtom';
import { getClusterConfig } from '../../../state/utils/getBackendInfo';
import { clusterState, ActiveClusterState } from '../../../state/clusterAtom';

export type FetchFn = ({
  isAbsolute,
  relativeUrl,
  abortController,
  init,
}: {
  isAbsolute?: string;
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
  isAbsolute,
  relativeUrl,
  abortController,
  init,
}: {
  isAbsolute?: string;
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
  console.log('lolo init', init);
  const { backendAddress } = getClusterConfig();

  console.log(
    'createFetchFn isAbsolute',
    isAbsolute,
    'relativeUrl',
    relativeUrl,
  );
  try {
    const response = await fetch(
      isAbsolute ? relativeUrl : backendAddress + relativeUrl,
      isAbsolute
        ? {
            ...init,
            headers: {
              'X-Cluster-Url': cluster?.currentContext.cluster.cluster.server,
              'X-Cluster-Certificate-Authority-Data':
                cluster?.currentContext.cluster.cluster[
                  'certificate-authority-data'
                ],
            },
          }
        : init,
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
