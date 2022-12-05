import { AtomEffect } from 'recoil';
import LuigiClient from '@luigi-project/client';
import { ClustersState } from '../clustersAtom';
import { Cluster } from '../clusterAtom';
import { ClusterStorage } from '../types';

type LocalStorageEffectFn = <T>(localStorageKey: string) => AtomEffect<T>;

const inMemoryClusters: ClustersState = {};

export const localStorageEffect: LocalStorageEffectFn = localStorageKey => ({
  setSelf,
  onSet,
}) => {
  setSelf(previousValue => {
    const savedValue = localStorage.getItem(localStorageKey);

    try {
      if (savedValue !== null) return JSON.parse(savedValue);
      return previousValue || {};
    } catch (e) {
      console.warn('Cannot get clusters', e);
      return previousValue || {};
    }
  });

  onSet(newValue =>
    localStorage.setItem(localStorageKey, JSON.stringify(newValue)),
  );
};

type ClusterStorageEffectFn = <T>(localStorageKey: string) => AtomEffect<T>;

export const clusterStorageEffect: ClusterStorageEffectFn = clusterStorageKey => ({
  setSelf,
  onSet,
}) => {
  setSelf(previousValue => {
    const savedValue = {
      ...JSON.parse(localStorage.getItem(clusterStorageKey) || '{}'),
      ...JSON.parse(sessionStorage.getItem(clusterStorageKey) || '{}'),
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

  onSet(newValue => {
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
          cluster.config = {
            requiresCA: cluster.config ? cluster.config.requiresCA : false,
            storage: 'localStorage',
          };
          localStorageClusters[clusterName] = cluster;
          break;
      }
    }

    localStorage.setItem(
      clusterStorageKey,
      JSON.stringify(localStorageClusters),
    );
    sessionStorage.setItem(
      clusterStorageKey,
      JSON.stringify(sessionStorageClusters),
    );
  });
};

type LuigiMessageEffect = <T>(
  luigiMessageId: string,
  newValueKey: string,
) => AtomEffect<T>;

export const luigiMessageEffect: LuigiMessageEffect = (
  luigiMessageId,
  newValueKey,
) => ({ onSet }) => {
  onSet(newValue => {
    LuigiClient.sendCustomMessage({
      id: luigiMessageId,
      [newValueKey]: newValue,
    });
  });
};
