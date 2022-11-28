import { atom, RecoilState } from 'recoil';
import { AuthDataState } from './authDataAtom';
import { localStorageEffect } from './utils/effects';

type ClusterConfig = {
  requiresCA: boolean;
  storage: 'localStorage' | 'sessionStorage' | string;
} | null;

export interface Cluster {
  config: ClusterConfig;
  contextName: string;
  currentContext: {
    cluster: {
      cluster: {
        server: string;
        'certificate-authority-data': string;
      };
      name: string;
    };
    user: {
      name: string;
      user: AuthDataState;
    };
  };
  kubeconfig: any;
}

interface ClusterWithName extends Cluster {
  name: string;
}

export type ActiveClusterState = ClusterWithName | null;

const CLUSTERS_STORAGE_KEY = 'busola.cluster';
const defaultValue = null;

export const clusterState: RecoilState<ActiveClusterState> = atom<
  ActiveClusterState
>({
  key: 'clusterState',
  default: defaultValue,
  effects: [localStorageEffect<ActiveClusterState>(CLUSTERS_STORAGE_KEY)],
});
