import { atom, RecoilState } from 'recoil';
import { CurrentContext, ValidKubeconfig } from 'types';
import { ClusterStorage } from './types';
import { localStorageEffect } from './utils/effects';

type ClusterConfig = {
  requiresCA: boolean;
  storage: ClusterStorage;
} | null;

export interface Cluster {
  config: ClusterConfig;
  contextName: string;
  currentContext: CurrentContext;
  kubeconfig: ValidKubeconfig;
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
