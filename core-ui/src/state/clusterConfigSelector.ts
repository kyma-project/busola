import { selector, RecoilValue } from 'recoil';
import { baseUrl } from 'shared/hooks/BackendAPI/config';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { authDataState } from './authDataAtom';
import { clusterState } from './clusterAtom';
import { configState } from './configAtom';
import { ClusterStorage } from './types';

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
    const { fromConfig } = get(configState) || {};

    if (!cluster || !authData || !fromConfig) {
      return null;
    }

    const url = baseUrl(fromConfig).backendAddress + '/api';
    const headers = createHeaders(authData, cluster, true);

    try {
      await fetch(url, { headers });
      return { requiresCA: true, storage: 'todo' };
    } catch {
      return { requiresCA: false, storage: 'todo' };
    }
  },
});
