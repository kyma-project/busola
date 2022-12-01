import { useRecoilValue } from 'recoil';

import { checkForTokenExpiration } from 'shared/hooks/BackendAPI/checkForTokenExpiration';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { baseUrl, throwHttpError } from 'shared/hooks/BackendAPI/config';
import { useConfig } from 'shared/contexts/ConfigContext';

import { authDataState, AuthDataState } from '../../../state/authDataAtom';
import {
  clusterConfigState,
  ClusterConfigState,
} from '../../../state/clusterConfigSelector';
import { FromConfig } from '../../../state/configAtom';
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
  fromConfig,
}: {
  authData: AuthDataState;
  cluster: ActiveClusterState;
  config: ClusterConfigState;
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
  const token = authData && 'token' in authData ? authData.token : undefined;
  checkForTokenExpiration(token);
  init = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      ...createHeaders(authData, cluster, config?.requiresCA!), //todo '!'
    },
    signal: abortController?.signal,
  };

  try {
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
  const { fromConfig } = useConfig() as any;

  const fetchFn = createFetchFn({
    authData,
    cluster,
    config,
    fromConfig,
  });
  return fetchFn;
};
