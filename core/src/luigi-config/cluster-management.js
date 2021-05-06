import { clearAuthData, setAuthData } from './auth/auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth } from './auth/auth';
import { saveLocation } from './navigation/previous-location';

const CLUSTERS_KEY = 'busola.clusters';
const CURRENT_CLUSTER_NAME_KEY = 'busola.current-cluster-name';

export function setActiveClusterIfPresentInUrl() {
  const match = location.pathname.match(/^\/cluster\/(.*?)\//);
  if (match) {
    const clusterName = match[1];
    if (clusterName in getClusters()) {
      saveActiveClusterName(clusterName);
    }
  }
}

export async function setCluster(clusterName) {
  const activeClusterName = getActiveClusterName();

  if (clusterName !== activeClusterName) {
    clearAuthData();
    saveActiveClusterName(clusterName);
    reloadAuth();

    const params = getActiveCluster();
    if (params.auth) {
      saveLocation(`/cluster/${clusterName}`);
      location = location.origin; // reload at root
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

export function getActiveCluster() {
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

export function deleteCluster(clusterName) {
  const clusters = getClusters();
  delete clusters[clusterName];
  saveClusters(clusters);
}

export function saveClusters(clusters) {
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(clusters));
}
