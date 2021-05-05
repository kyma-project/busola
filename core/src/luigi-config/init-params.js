import createEncoder from 'json-url';

const CLUSTERS_KEY = 'busola.clusters';
const CURRENT_CLUSTER_NAME_KEY = 'busola.current-cluster-name';
const encoder = createEncoder('lzma');

function getResponseParams(usePKCE = true) {
  if (usePKCE) {
    return {
      responseType: 'code',
      responseMode: 'query',
    };
  } else {
    return { responseType: 'id_token' };
  }
}

function createSystemNamespacesList(namespaces) {
  return namespaces ? namespaces.split(' ') : [];
}

export async function saveInitParamsIfPresent(location) {
  const initParams = new URL(location).searchParams.get('init');
  if (initParams) {
    const decoded = await encoder.decompress(initParams);
    const systemNamespaces = createSystemNamespacesList(
      decoded.config?.systemNamespaces
    );
    const params = {
      ...decoded,
      config: {
        ...decoded.config,
        systemNamespaces,
      },
    };
    if (decoded.auth) {
      params.auth = {
        ...decoded.auth,
        ...getResponseParams(decoded.auth.usePKCE),
      };
    }
    saveInitParams(params); // todo rename dis
    saveCurrentClusterName(params.cluster.name);
  }
}

export function saveInitParams(params) {
  const clusterName = params.cluster.name;
  const clusters = getClusters();
  clusters[clusterName] = params;
  saveClusters(clusters);
}

export function getInitParams() {
  const clusterName = getCurrentClusterName();
  if (!clusterName) {
    return null;
  }
  return getClusters()[clusterName];
}

export function clearInitParams() {
  alert('clear init params? Nie sądzę');
  // localStorage.removeItem(CLUSTERS_KEY);
}

export function getCurrentClusterName() {
  return localStorage.getItem(CURRENT_CLUSTER_NAME_KEY);
}

export function saveCurrentClusterName(clusterName) {
  localStorage.setItem(CURRENT_CLUSTER_NAME_KEY, clusterName);
}

export function getClusters() {
  return JSON.parse(localStorage.getItem(CLUSTERS_KEY) || '{}');
}

export function saveClusters(clusters) {
  localStorage.setItem(CLUSTERS_KEY, JSON.stringify(clusters));
}
