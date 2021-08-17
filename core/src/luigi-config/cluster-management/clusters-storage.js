import { getActiveCluster, getActiveClusterName } from './cluster-management';

const CLUSTERS_KEY = 'busola.clusters';

let inMemoryClusters = {};

export function load() {
  return {
    ...JSON.parse(localStorage.getItem(CLUSTERS_KEY) || '{}'),
    ...JSON.parse(sessionStorage.getItem(CLUSTERS_KEY) || '{}'),
    ...inMemoryClusters,
  };
}

export function save(clusters, defaultStorage) {
  localStorage.removeItem(CLUSTERS_KEY);
  sessionStorage.removeItem(CLUSTERS_KEY);
  const localStorageClusters = {};
  const sessionStorageClusters = {};
  inMemoryClusters = {};

  for (const [clusterName, cluster] of Object.entries(clusters)) {
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
  const targetStorage = (await getActiveCluster()).config.storage;
  if (targetStorage !== originalStorage) {
    // move the cluster to the valid storage
    const clusters = load();
    clusters[getActiveClusterName()].config.storage = targetStorage;
    save(clusters, null);

    if (originalStorage) {
      Luigi.ux().showAlert({
        text: `Cluster storage changed from ${originalStorage} to ${targetStorage}.`,
        type: 'info',
      });
    }
  }
}
