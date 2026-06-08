import { useAtomValue } from 'jotai';

import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { throwHttpError } from 'shared/hooks/BackendAPI/config';

import { authDataAtom, AuthDataState } from '../../../state/authDataAtom';
import { getClusterConfig } from '../../../state/utils/getBackendInfo';
import { ActiveClusterState, clusterAtom } from '../../../state/clusterAtom';
import {
  ssoDataAtom,
  SsoDataState,
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
    ssoData,
  }: {
    authData: AuthDataState;
    cluster: ActiveClusterState;
    ssoData: SsoDataState;
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
  const ssoData = useAtomValue(ssoDataAtom);

  const fetchFn = createFetchFn({
    authData,
    cluster,
    ssoData,
  });
  return fetchFn;
};
