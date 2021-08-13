import { getTargetClusterConfig } from '../utils/target-cluster-config';
import { getActiveCluster, getClusters } from './cluster-management';

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
        );
        break;
    }
    console.log(cluster.config.storage);
  }
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(localStorageClusters));
  sessionStorage.setItem(CLUSTERS_KEY, JSON.stringify(sessionStorageClusters));
}

export async function checkClusterStorageType() {
  console.log(await getClusters());
  const a = (await getActiveCluster()).config.storage;
  const b = getTargetClusterConfig()?.storage;
  if (b && a !== b) {
    alert(a + b);
  } else {
    console.log(
      'cluster.config',
      JSON.parse(JSON.stringify((await getActiveCluster()).config.storage)),
    );
    if (b) {
      console.log(
        'getTargetClusterConfig.config',
        JSON.parse(JSON.stringify(b)),
      );
    } else {
      console.log('no b');
    }
  }
}
