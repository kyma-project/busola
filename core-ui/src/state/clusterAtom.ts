import { atom, RecoilState } from 'recoil';
import { AuthDataState } from './authDataAtom';
import { localStorageEffect } from './utils/effects';

type ClusterConfigState = {
  requiresCA: boolean;
  storage: 'localStorage' | 'sessionStorage' | string;
} | null;

export type ClusterState = {
  config: ClusterConfigState;
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
  name: string;
} | null;

const CLUSTERS_STORAGE_KEY = 'busola.cluster';
const defaultValue = null;

export const clusterState: RecoilState<ClusterState> = atom<ClusterState>({
  key: 'clusterState',
  default: defaultValue,
  effects: [localStorageEffect<ClusterState>(CLUSTERS_STORAGE_KEY)],
});
