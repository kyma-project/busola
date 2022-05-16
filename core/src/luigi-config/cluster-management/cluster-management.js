import { setAuthData, clearAuthData, getAuthData } from '../auth/auth-storage';
import { reloadNavigation } from '../navigation/navigation-data-init';
import { reloadAuth, hasNonOidcAuth } from '../auth/auth';
import { saveLocation } from '../navigation/previous-location';
import { createLoginCommand, parseOIDCParams } from '../auth/oidc-params';
import { DEFAULT_HIDDEN_NAMESPACES, DEFAULT_FEATURES } from '../constants';
import { getBusolaClusterParams } from '../busola-cluster-params';
import {
  getTargetClusterConfig,
  loadTargetClusterConfig,
} from '../utils/target-cluster-config';
import { checkIfClusterRequiresCA } from '../navigation/queries';
import * as clusterStorage from './clusters-storage';
import { fetchCache } from '../cache/fetch-cache';
import { clearClusterCache } from '../cache/storage';
import { isNil } from 'lodash';

const CURRENT_CLUSTER_NAME_KEY = 'busola.current-cluster-name';

export function setActiveClusterIfPresentInUrl() {
  const match = window.location.pathname.match(/^\/cluster\/(.*?)\//);
  if (match) {
    const clusterName = decodeURIComponent(match[1]);
    const clusters = getClusters();
    if (clusterName in clusters) {
      saveActiveClusterName(clusterName);
    }
  }
}

export function getCurrentContextNamespace(kubeconfig) {
  const currentContextName = kubeconfig['current-context'];
  const context = kubeconfig.contexts.find(c => c.name === currentContextName);
  return context?.context.namespace;
}

export function getAfterLoginLocation(clusterName, kubeconfig) {
  const preselectedNamespace = getCurrentContextNamespace(kubeconfig);

  return `/cluster/${encodeURIComponent(clusterName)}/${
    preselectedNamespace
      ? `namespaces/${preselectedNamespace}/details`
      : 'overview'
  }`;
}

export async function setCluster(clusterName) {
  const clusters = getClusters();
  const params = clusters[clusterName];

  const originalStorage = clusters[clusterName].config.storage;

  saveActiveClusterName(clusterName);
  fetchCache.init(clusterName);
  try {
    await reloadAuth();

    const kubeconfigUser = params.currentContext.user.user;

    const targetLocation = getAfterLoginLocation(
      clusterName,
      params.kubeconfig,
    );

    if (hasNonOidcAuth(kubeconfigUser)) {
      setAuthData(kubeconfigUser);
      Luigi.navigation().navigate(targetLocation);
      await saveCARequired();
      await loadTargetClusterConfig();
      await clusterStorage.checkClusterStorageType(originalStorage);
      await reloadNavigation();
      setTimeout(() => Luigi.navigation().navigate(targetLocation));
    } else {
      saveLocation(targetLocation);
      window.location = window.location.origin;
    }
  } catch (e) {
    console.warn(e);
    alert('An error occured while setting up the cluster.');
    saveActiveClusterName(null);
    fetchCache.clear();
  }
}

export async function saveClusterParams(params) {
  const { kubeconfig } = params;
  const { users } = kubeconfig;
  if (users?.length) {
    users.forEach(user => {
      user.user = user.user || {};
      if (!hasNonOidcAuth(user.user) && !!user.exec) {
        // it's needed for the downloaded kubeconfig to work
        user.user.exec = createLoginCommand(parseOIDCParams());
      }
    });
  }

  const clusterName = params.kubeconfig['current-context'];
  const clusters = getClusters();
  const prevConfig = clusters[clusterName]?.config || {};
  clusters[clusterName] = {
    ...params,
    config: { ...prevConfig, ...params.config },
  };
  await saveClusters(clusters);
}

export async function saveCARequired() {
  const clusters = clusterStorage.load();
  const cluster = clusters[getActiveClusterName()];
  if (isNil(cluster?.config.requiresCA)) {
    cluster.config = {
      ...cluster.config,
      requiresCA: await checkIfClusterRequiresCA(getAuthData()),
    };
    await saveClusterParams(cluster);
  }
}

export function getActiveCluster() {
  const clusters = clusterStorage.load();
  const clusterName = getActiveClusterName();
  const activeCluster = clusters[clusterName];
  return activeCluster;
}

let currentClusterName = null;
export function getActiveClusterName() {
  return localStorage.getItem(CURRENT_CLUSTER_NAME_KEY) || currentClusterName;
}

export function saveActiveClusterName(clusterName) {
  if (clusterName) {
    localStorage.setItem(CURRENT_CLUSTER_NAME_KEY, clusterName);
    currentClusterName = clusterName;
  } else {
    localStorage.removeItem(CURRENT_CLUSTER_NAME_KEY);
    currentClusterName = null;
  }
}

// setup params:
// defaults < config from Busola cluster CM < (config from target cluster CM)
export async function getCurrentConfig() {
  let config = {
    navigation: { disabledNodes: [] },
    hiddenNamespaces: DEFAULT_HIDDEN_NAMESPACES,
    features: DEFAULT_FEATURES,
  };

  const busolaClusterParams = await getBusolaClusterParams();
  const targetCluterConfig = getActiveClusterName()
    ? await getTargetClusterConfig()
    : {};

  const features = {
    ...config.features,
    ...busolaClusterParams?.config?.features,
    ...targetCluterConfig?.config?.features,
  };

  config = {
    ...config,
    ...busolaClusterParams?.config,
    ...targetCluterConfig?.config,
  };
  config.features = features;

  // Don't merge hiddenNamespaces, use the defaults only when params are empty
  config.hiddenNamespaces =
    config?.hiddenNamespaces || DEFAULT_HIDDEN_NAMESPACES;

  return config;
}

export function getClusters() {
  return clusterStorage.load();
}

export async function deleteCluster(clusterName) {
  const clusters = getClusters();
  delete clusters[clusterName];
  await saveClusters(clusters);
  clearClusterCache(clusterName);
}

export async function deleteActiveCluster() {
  await deleteCluster(getActiveClusterName());
  await reloadAuth();
  clearAuthData();
  saveActiveClusterName(null);
  Luigi.navigation().navigate('/clusters');
  // even though we navigate to /clusters, Luigi complains it can't find
  // current cluster path in navigation - skip a frame to fix it
  await new Promise(resolve => setTimeout(resolve));
  await reloadNavigation();
}

export async function saveClusters(clusters) {
  await clusterStorage.save(clusters);
}

export function handleResetEndpoint() {
  if (window.location.pathname === '/reset') {
    saveActiveClusterName(null);
    // we could use location = '/clusters', but it would trigger unnecessary reload
    window.history.replaceState(null, window.document.title, '/clusters');
  }
}
