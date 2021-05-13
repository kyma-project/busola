import createEncoder from 'json-url';
import { DEFAULT_MODULES } from './default-modules';
import {
  saveClusterParams,
  saveActiveClusterName,
  setCluster,
} from './cluster-management';

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

export async function saveInitParamsIfPresent() {
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
        modules: { ...DEFAULT_MODULES, ...(decoded.config?.modules || {}) },
      },
    };
    if (decoded.auth) {
      params.auth = {
        ...decoded.auth,
        ...getResponseParams(decoded.auth.usePKCE),
      };
    }
    if (!params.cluster.name) {
      params.cluster.name = params.cluster.server.replace(
        /^https?:\/\/(api\.)?/,
        ''
      );
    }

    const clusterName = params.cluster.name;
    saveClusterParams(params);
    saveActiveClusterName(clusterName);
    setCluster(clusterName);
  }
}
