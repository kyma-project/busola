import { useRecoilValue } from 'recoil';

import { checkForTokenExpiration } from 'shared/hooks/BackendAPI/checkForTokenExpiration';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { baseUrl, throwHttpError } from 'shared/hooks/BackendAPI/config';
import { useConfig } from 'shared/contexts/ConfigContext';

import { authDataState, AuthDataState } from '../../../state/authDataAtom';
import { ssoDataState, SsoDataState } from '../../../state/ssoDataAtom';
import {
  clusterConfigState,
  ClusterConfigState,
} from '../../../state/clusterConfigAtom';
import { configState, FromConfig } from '../../../state/configAtom';
import { clusterState, ClusterState } from '../../../state/clusterAtom';

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
  fromConfig,
}: {
  authData: AuthDataState;
  cluster: ClusterState;
  config: ClusterConfigState;
  ssoData: SsoDataState;
  fromConfig: FromConfig;
}): FetchFn => async ({
  relativeUrl,
  abortController,
  init,
}: {
  relativeUrl: string;
  init?: any;
  abortController?: AbortController;
}) => {
  console.log('0');
  const token = authData && 'token' in authData ? authData.token : undefined;
  checkForTokenExpiration(token);
  checkForTokenExpiration(ssoData?.idToken, { reason: 'sso-expiration' });
  init = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...createHeaders(authData, cluster, config?.requiresCA, ssoData),
    },
    signal: abortController?.signal,
  };

  try {
    console.log('1');
    const response = await fetch(baseUrl(fromConfig) + relativeUrl, init);
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
  const { fromConfig } = useConfig() as any;

  if (!authData) return () => {};
  const fetchFn = createFetchFn({
    authData,
    cluster,
    config,
    ssoData,
    fromConfig,
  });
  return fetchFn;
};
