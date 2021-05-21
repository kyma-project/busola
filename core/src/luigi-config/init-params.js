import createEncoder from 'json-url';
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
  const DEFAULT_MODULES = {
    SERVICE_CATALOG: 'servicecatalog.k8s.io',
    SERVICE_CATALOG_ADDONS: 'servicecatalog.kyma-project.io',
    EVENTING: 'eventing.kyma-project.io',
    API_GATEWAY: 'gateway.kyma-project.io',
    APPLICATIONS: 'applicationconnector.kyma-project.io',
    ADDONS: 'addons.kyma-project.io',
    SERVERLESS: 'serverless.kyma-project.io',
    SERVERLESS_REPOS: 'gitrepositories.serverless.kyma-project.io',
  };

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

    if (!params.auth || !params.cluster) {
      // Luigi navigate doesn't work here. Simulate the Luigi's nodeParams by adding the `~`
      window.location.href =
        window.location.origin + '/clusters/add?~init=' + initParams;
      return;
    }

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
