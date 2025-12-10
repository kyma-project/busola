import { atom } from 'jotai';
import { Cluster } from './clusterAtom';
import { ClusterStorage } from './types';

import { atomEffect, withAtomEffect } from 'jotai-effect';
export const CLUSTERS_STORAGE_KEY = 'busola.clusters';

export type ClustersState = {
  [clusterName: string]: Cluster;
} | null;

const inMemoryClusters: ClustersState = {};

const getInitialClustersState = (): ClustersState => {
  try {
    const localStorageClusters = JSON.parse(
      localStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}',
    );
    const sessionStorageClusters = JSON.parse(
      sessionStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}',
    );
    return {
      ...localStorageClusters,
      ...sessionStorageClusters,
      ...inMemoryClusters,
    };
  } catch (e) {
    console.warn('Cannot get clusters', e);
    return {};
  }
};

export const clustersAtom = atom<ClustersState>(getInitialClustersState());
clustersAtom.debugLabel = 'clustersAtom';

export const clustersAtomEffectSetSelf = withAtomEffect(
  clustersAtom,
  (_get, set) => {
    set(clustersAtom, (previousValue: ClustersState) => {
      const savedValue = {
        ...JSON.parse(localStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}'),
        ...JSON.parse(sessionStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}'),
        ...inMemoryClusters,
      };

      try {
        if (savedValue !== null) return savedValue;
        return previousValue || {};
      } catch (e) {
        console.warn('Cannot get clusters', e);
        return previousValue || {};
      }
    });
  },
);
clustersAtomEffectSetSelf.debugLabel = 'clustersAtomEffectSetSelf';

export const clustersAtomEffectOnSet = atomEffect((get, _set) => {
  const newValue = get(clustersAtom);

  const localStorageClusters: ClustersState = {};
  const sessionStorageClusters: ClustersState = {};
  const clusters = newValue ? Object.entries(newValue) : [];

  for (const key in clusters) {
    const clusterName: string = clusters[key as keyof ClustersState][0];
    const cluster = clusters[key as keyof ClustersState][1] as Cluster;
    const storage: ClusterStorage = cluster.config
      ? cluster.config.storage || 'sessionStorage'
      : 'sessionStorage';

    switch (storage) {
      case 'localStorage':
        localStorageClusters[clusterName] = cluster;
        break;
      case 'sessionStorage':
        sessionStorageClusters[clusterName] = cluster;
        break;
      case 'inMemory':
        inMemoryClusters[clusterName] = cluster;
        break;
      default:
        console.warn(
          clusterName,
          ': Unknown storage type ',
          cluster?.config?.storage,
          'saving in localStorage',
        );
        cluster.config = { storage: 'localStorage' };
        localStorageClusters[clusterName] = cluster;
        break;
    }
  }

  localStorage.setItem(
    CLUSTERS_STORAGE_KEY,
    JSON.stringify(localStorageClusters),
  );
  sessionStorage.setItem(
    CLUSTERS_STORAGE_KEY,
    JSON.stringify(sessionStorageClusters),
  );
});
clustersAtomEffectOnSet.debugLabel = 'clustersAtomEffectOnSet';
