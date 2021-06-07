import { setAuthData } from './auth/auth-storage';
import { reloadNavigation } from './navigation/navigation-data-init';
import { reloadAuth, hasKubeconfigAuth } from './auth/auth';
import { saveLocation } from './navigation/previous-location';

const CLUSTERS_KEY = 'busola.clusters';
const CURRENT_CLUSTER_NAME_KEY = 'busola.current-cluster-name';

export function setActiveClusterIfPresentInUrl() {
  const match = location.pathname.match(/^\/cluster\/(.*?)\//);
  if (match) {
    const clusterName = decodeURIComponent(match[1]);
    if (clusterName in getClusters()) {
      saveActiveClusterName(clusterName);
    }
  }
}

export async function setCluster(clusterName) {
  saveActiveClusterName(clusterName);
  reloadAuth();

  const params = getActiveCluster();
  const kubeconfigUser = params.currentContext.user.user;
  if (hasKubeconfigAuth(kubeconfigUser)) {
    setAuthData(kubeconfigUser);
    await reloadNavigation();
    Luigi.navigation().navigate(
      `/cluster/${encodeURIComponent(clusterName)}/namespaces`,
    );
  } else {
    saveLocation(`/cluster/${encodeURIComponent(clusterName)}`);
    location = location.origin;
  }
}

export function saveClusterParams(params) {
  const { kubeconfig, config } = params;
  const { users } = kubeconfig;
  if (users?.length) {
    users.forEach(user => {
      user.user = user.user || {};
      if (!user.user.token && config.auth) {
        // it's needed for the downloaded kubeconfig to work
        user.user.exec = {
          apiVersion: 'client.authentication.k8s.io/v1beta1',
          command: 'kubectl',
          args: [
            'oidc-login',
            'get-token',
            `--oidc-issuer-url=${config.auth.issuerUrl}`,
            `--oidc-client-id=${config.auth.clientId}`,
          ],
        };
      }
    });
  }

  const clusterName = params.currentContext.cluster.name;
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

export async function deleteActiveCluster() {
  deleteCluster(getActiveClusterName());
  saveActiveClusterName(null);
  Luigi.navigation().navigate('/clusters');
  // even though we navigate to /clusters, Luigi complains it can't find
  // current cluster path in navigation - skip a frame to fix it
  await new Promise(resolve => setTimeout(resolve));
  await reloadNavigation();
}

export function saveClusters(clusters) {
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(clusters));
}
