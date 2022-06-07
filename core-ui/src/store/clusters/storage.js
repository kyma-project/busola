const CURRENT_CLUSTER_NAME_KEY = 'busola.current-cluster-name';
const CLUSTERS_KEY = 'busola.clusters';

export function saveClusterName(clusterName) {
  localStorage.setItem(CURRENT_CLUSTER_NAME_KEY, clusterName);
}

export function loadCurrentClusterName() {
  return localStorage.getItem(CURRENT_CLUSTER_NAME_KEY);
}

export function saveClusters(clusters) {
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(clusters));
}

export function loadClusters() {
  return JSON.parse(localStorage.getItem(CLUSTERS_KEY) || '{}');
}
