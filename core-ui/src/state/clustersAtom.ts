import { atom, RecoilState } from 'recoil';
import { clusterStorageEffect } from './utils/effects';
import { Cluster } from './clusterAtom';

export type ClustersState = {
  [clusterName: string]: Cluster;
} | null;

export const CLUSTERS_STORAGE_KEY = 'busola.clusters';
const defaultValue = {};

export const clustersState: RecoilState<ClustersState> = atom<ClustersState>({
  key: 'clustersState',
  default: defaultValue,
  effects: [clusterStorageEffect<ClustersState>(CLUSTERS_STORAGE_KEY)],
});
