import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from './utils/effects';

export type ClustersState = {
  [clusterName: string]: {
    config: {
      storage: string;
      requiresCA: boolean;
    };
    contextName: string;
    currentContext: {
      cluster: object; // todo add type
      name: string;
    };
    kubeconfig: {
      kubeconfig: object; // todo add type
      name: string;
    };
  };
} | null;

const CLUSTERS_STORAGE_KEY = 'busola.clusters';
const defaultValue = {};

export const clustersState: RecoilState<ClustersState> = atom<ClustersState>({
  key: 'clustersState',
  default: defaultValue,
  effects: [localStorageEffect<ClustersState>(CLUSTERS_STORAGE_KEY)],
});
