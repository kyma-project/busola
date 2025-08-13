import { atom } from 'jotai';
import { Cluster } from './clusterAtom';
import { ClusterStorage } from './types';

import { atomEffect, withAtomEffect } from 'jotai-effect';
export const CLUSTERS_STORAGE_KEY = 'busola.clusters';

export type ClustersState = {
  [clusterName: string]: Cluster;
} | null;

export const clustersState = atom<ClustersState>({});

const inMemoryClusters: ClustersState = {};

export const clustersStateEffectSetSelf = withAtomEffect(
  clustersState,
  (_get, set) => {
    set(clustersState, (previousValue: ClustersState) => {
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

export const clustersStateEffectOnSet = atomEffect((get, _set) => {
  const newValue = get(clustersState);

  const localStorageClusters: ClustersState = {};
  const sessionStorageClusters: ClustersState = {};
  const clusters = newValue ? Object.entries(newValue) : [];

  for (const key in clusters) {
    const clusterName: string = clusters[key as keyof ClustersState][0];
    let cluster = clusters[key as keyof ClustersState][1] as Cluster;
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

clustersState.debugLabel = 'clustersState';
clustersStateEffectOnSet.debugLabel = 'clustersStateEffectOnSet';
clustersStateEffectSetSelf.debugLabel = 'clustersStateEffectSetSelf';
