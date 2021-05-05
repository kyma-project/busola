import { clearAuthData, setAuthData } from './auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth } from './auth';

const CLUSTERS_KEY = 'busola.clusters';
const CURRENT_CLUSTER_NAME_KEY = 'busola.current-cluster-name';

export async function setCluster(clusterName) {
  const activeClusterName = getActiveClusterName();

  if (clusterName !== activeClusterName) {
    clearAuthData();
    saveActiveClusterName(clusterName);
    await reloadAuth();

    const params = getInitParams();
    if (params.auth) {
      location = `${location.origin}/cluster/${clusterName}`;
      return;
    } else {
      setAuthData(params.rawAuth);
      await reloadNavigation();
    }
  }
  Luigi.navigation().navigate(`/cluster/${clusterName}`);
}

export function saveClusterParams(params) {
  const clusterName = params.cluster.name;
  const clusters = getClusters();
  clusters[clusterName] = params;
  saveClusters(clusters);
}

export function getInitParams() {
  const clusterName = getActiveClusterName();
  if (!clusterName) {
    return null;
  }
  return getClusters()[clusterName];
}

export function getActiveClusterName() {
  return localStorage.getItem(CURRENT_CLUSTER_NAME_KEY);
}

export function saveActiveClusterName(clusterName) {
  localStorage.setItem(CURRENT_CLUSTER_NAME_KEY, clusterName);
}

export function getClusters() {
  return JSON.parse(localStorage.getItem(CLUSTERS_KEY) || '{}');
}

export function saveClusters(clusters) {
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(clusters));
}
