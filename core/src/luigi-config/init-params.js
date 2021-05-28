import createEncoder from 'json-url';
import {
  saveClusterParams,
  saveActiveClusterName,
  setCluster,
} from './cluster-management';
import { hasKubeconfigAuth } from './auth/auth';

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

  const encodedParams = new URL(location).searchParams.get('init');
  if (encodedParams) {
    const decoded = await encoder.decompress(encodedParams);

    const isKubeconfigPresent = !!Object.keys(decoded.kubeconfig || {}).length;
    const kubeconfigUser =
      decoded.kubeconfig?.users && decoded.kubeconfig?.users[0].user;
    const isOidcAuthPresent = decoded.config?.auth;

    if (
      !isKubeconfigPresent ||
      (!isOidcAuthPresent && !hasKubeconfigAuth(kubeconfigUser))
    ) {
      // Luigi navigate doesn't work here. Simulate the Luigi's nodeParams by adding the `~`
      window.location.href =
        window.location.origin + '/clusters/add?~init=' + encodedParams;
      return;
    }

    const params = {
      ...decoded,
      config: {
        ...decoded.config,
        modules: { ...DEFAULT_MODULES, ...(decoded.config?.modules || {}) },
      },
      currentContext: {
        cluster: decoded?.kubeconfig?.clusters[0],
        user: decoded?.kubeconfig?.users[0],
      },
    };

    if (params.config.auth && !hasKubeconfigAuth(kubeconfigUser)) {
      // no auth in kubeconfig, setup OIDC auth
      params.config.auth = {
        ...params.config.auth,
        ...getResponseParams(params.config.auth.usePKCE),
      };
    }
    const clusterName = params.currentContext.cluster.name;
    saveClusterParams(params);
    setCluster(clusterName);
  }
}
