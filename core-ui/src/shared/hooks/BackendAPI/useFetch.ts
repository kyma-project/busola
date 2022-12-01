import { useRecoilValue } from 'recoil';

import { checkForTokenExpiration } from 'shared/hooks/BackendAPI/checkForTokenExpiration';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { throwHttpError } from 'shared/hooks/BackendAPI/config';

import { authDataState, AuthDataState } from '../../../state/authDataAtom';
import { ssoDataState, SsoDataState } from '../../../state/ssoDataAtom';
import {
  clusterConfigState,
  ClusterConfigState,
} from '../../../state/clusterConfigSelector';
import { getClusterConfig } from '../../../state/utils/getBackendInfo';
import { clusterState, ActiveClusterState } from '../../../state/clusterAtom';

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
  config,
  ssoData,
  backendAddress,
}: {
  authData: AuthDataState;
  cluster: ActiveClusterState;
  config: ClusterConfigState;
  ssoData: SsoDataState;
  backendAddress: string;
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
  checkForTokenExpiration(ssoData?.idToken, { reason: 'sso-expiration' });
  init = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...createHeaders(authData, cluster, config?.requiresCA!, ssoData), //todo '!'
    },
    signal: abortController?.signal,
  };

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
  const config = useRecoilValue(clusterConfigState);
  const ssoData = useRecoilValue(ssoDataState);
  const { backendAddress } = getClusterConfig();

  const fetchFn = createFetchFn({
    authData,
    cluster,
    config,
    ssoData,
    backendAddress,
  });
  return fetchFn;
};
