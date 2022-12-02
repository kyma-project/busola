import { AtomEffect } from 'recoil';
import LuigiClient from '@luigi-project/client';
import { ClustersState } from '../clustersAtom';
import { Cluster } from '../clusterAtom';

type LocalStorageEffectFn = <T>(localStorageKey: string) => AtomEffect<T>;

let inMemoryClusters: any = {};

export const localStorageEffect: LocalStorageEffectFn = localStorageKey => ({
  setSelf,
  onSet,
}) => {
  setSelf(previousValue => {
    const savedValue = localStorage.getItem(localStorageKey);
    console.log('inMemoryClusters', inMemoryClusters);
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
    console.log(
      'setSelf clusterStorageEffect clusterStorageKey',
      clusterStorageKey,
      'previousValue',
      previousValue,
    );
    const savedValue = localStorage.getItem(clusterStorageKey);
    const savedValue2 = {
      ...JSON.parse(localStorage.getItem(clusterStorageKey) || '{}'),
      ...JSON.parse(sessionStorage.getItem(clusterStorageKey) || '{}'),
    };
    console.log('savedValue2', savedValue2);
    try {
      if (savedValue !== null) return JSON.parse(savedValue);
      return previousValue || {};
    } catch (e) {
      console.warn('Cannot get clusters', e);
      return previousValue || {};
    }
  });

  onSet(newValue => {
    console.log(
      'onSet clusterStorageEffect clusterStorageKey',
      clusterStorageKey,
      'newValue',
      newValue,
    );
    const localStorageClusters: ClustersState = {};
    const sessionStorageClusters: ClustersState = {};
    const clusters = newValue ? Object.entries(newValue) : [];
    console.log('Object.entries(newValue)', clusters);

    for (const [clusterName, cluster] of clusters) {
      const config = cluster ? cluster.config : 'localStorage';
      console.log(
        'clusterName',
        clusterName,
        'cluster',
        cluster.config,
        cluster.config,
      );
      switch (config) {
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
          cluster.config.storage = 'localStorage';
          localStorageClusters[clusterName] = cluster;
          break;
      }
    }
    console.log('localStorageClusters', localStorageClusters);
    console.log('sessionStorageClusters', sessionStorageClusters);
    console.log('inMemoryClusters', inMemoryClusters);
    return localStorage.setItem(clusterStorageKey, JSON.stringify(newValue));
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
