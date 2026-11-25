import { useAtomValue } from 'jotai';

import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { throwHttpError } from 'shared/hooks/BackendAPI/config';

import { authDataAtom, AuthDataState } from '../../../state/authDataAtom';
import { getClusterConfig } from '../../../state/utils/getBackendInfo';
import { ActiveClusterState, clusterAtom } from '../../../state/clusterAtom';
import {
  ssoFetchStateAtom,
  SsoFetchState,
  checkForTokenExpiration,
} from 'state/ssoDataAtom';

export type FetchFn = ({
  relativeUrl,
  abortController,
  init,
}: {
  relativeUrl: string;
  init?: any;
  abortController?: AbortController;
}) => Promise<Response>;

export const createFetchFn =
  ({
    authData,
    cluster,
    sso,
  }: {
    authData: AuthDataState;
    cluster: ActiveClusterState;
    sso: SsoFetchState;
  }): FetchFn =>
  async ({
    relativeUrl,
    abortController,
    init,
  }: {
    relativeUrl: string;
    init?: any;
    abortController?: AbortController;
  }) => {
    if (!sso.isReady) {
      throw new Error('SSO login is in progress; request deferred.');
    }

    checkForTokenExpiration(sso.data?.id_token);

    init = {
      ...init,
      headers: {
        ...(init?.headers || {}),
        ...createHeaders(authData, cluster, sso.data),
      },
      signal: abortController?.signal,
    };
    const { backendAddress } = getClusterConfig();

    const response = await fetch(backendAddress + relativeUrl, init);
    if (response.ok) {
      return response;
    } else {
      throw await throwHttpError(response);
    }
  };

export const useFetch = () => {
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const sso = useAtomValue(ssoFetchStateAtom);

  const fetchFn = createFetchFn({ authData, cluster, sso });
  return fetchFn;
};
