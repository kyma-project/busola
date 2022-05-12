import i18next from 'i18next';
import { getBusolaClusterParams } from '../busola-cluster-params';
import { showAlert } from '../utils/showAlert';
import { getTargetClusterConfig } from '../utils/target-cluster-config';
import {
  getActiveCluster,
  getActiveClusterName,
  getCurrentConfig,
} from './cluster-management';

const CLUSTERS_KEY = 'busola.clusters';

let inMemoryClusters = {};

export function load() {
  return {
    ...JSON.parse(localStorage.getItem(CLUSTERS_KEY) || '{}'),
    ...JSON.parse(sessionStorage.getItem(CLUSTERS_KEY) || '{}'),
    ...inMemoryClusters,
  };
}

export async function save(clusters) {
  clear();

  const defaultStorage = await getDefaultStorage();

  const localStorageClusters = {};
  const sessionStorageClusters = {};
  for (const [clusterName, cluster] of Object.entries(clusters)) {
    console.log(clusterName, cluster, cluster?.config?.storage);
    switch (cluster?.config?.storage || defaultStorage) {
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
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(localStorageClusters));
  sessionStorage.setItem(CLUSTERS_KEY, JSON.stringify(sessionStorageClusters));
}

export async function checkClusterStorageType(originalStorage) {
  console.log('target cluster config', getTargetClusterConfig());
  const targetStorage = getTargetClusterConfig().config?.storage;
  console.log('target', targetStorage, 'org', originalStorage);
  if (!!targetStorage && targetStorage !== originalStorage) {
    // move the cluster to the valid storage
    const clusters = load();
    clusters[getActiveClusterName()].config.storage = targetStorage;
    await save(clusters);

    if (originalStorage) {
      showAlert({
        text: i18next.t('clusters.storage.changed-message', {
          originalStorage,
          targetStorage,
        }),
        type: 'info',
        closeAfter: 7500,
      });
    }
  }
}

export async function getDefaultStorage() {
  return (await getBusolaClusterParams()).config?.storage || 'sessionStorage';
}

function clear() {
  localStorage.removeItem(CLUSTERS_KEY);
  sessionStorage.removeItem(CLUSTERS_KEY);
  inMemoryClusters = {};
}
