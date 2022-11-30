import { selector, RecoilValue } from 'recoil';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { authDataState } from './authDataAtom';
import { clusterState } from './clusterAtom';
import { ssoDataState } from './ssoDataAtom';
import { ClusterStorage } from './types';
import { getClusterConfig } from './utils/getBackendInfo';

export type ClusterConfigState = {
  requiresCA: boolean;
  storage: ClusterStorage;
} | null;

export const clusterConfigState: RecoilValue<ClusterConfigState> = selector<
  ClusterConfigState
>({
  key: 'clusterConfigState',
  get: async ({ get }) => {
    const cluster = get(clusterState);
    const authData = get(authDataState);
    const { backendAddress } = getClusterConfig();
    const ssoData = get(ssoDataState);

    if (!cluster || !authData || !backendAddress) {
      return null;
    }

    const url = backendAddress + '/api';
    const headers = createHeaders(authData, cluster, true, ssoData);

    try {
      await fetch(url, { headers });
      return { requiresCA: true, storage: 'todo' };
    } catch {
      return { requiresCA: false, storage: 'todo' };
    }
  },
});
