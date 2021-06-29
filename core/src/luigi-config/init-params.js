import createEncoder from 'json-url';
import {
  saveClusterParams,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from './cluster-management';
import { hasNonOidcAuth } from './auth/auth';
import { saveLocation } from './navigation/previous-location';

const DEFAULT_MODULES = {
  SERVICE_CATALOG: 'servicecatalog.k8s.io',
  SERVICE_CATALOG_ADDONS: 'servicecatalog.kyma-project.io',
  EVENTING: 'eventing.kyma-project.io',
  API_GATEWAY: 'gateway.kyma-project.io',
  APPLICATIONS: 'applicationconnector.kyma-project.io',
  ADDONS: 'addons.kyma-project.io',
  SERVERLESS: 'serverless.kyma-project.io',
};

const DEFAULT_HIDDEN_NAMESPACES = [
  'istio-system',
  'knative-eventing',
  'knative-serving',
  'kube-public',
  'kube-system',
  'kyma-backup',
  'kyma-installer',
  'kyma-integration',
  'kyma-system',
  'natss',
  'kube-node-lease',
  'kubernetes-dashboard',
  'serverless-system',
];

const encoder = createEncoder('lzma');

function hasExactlyOneContext(kubeconfig) {
  return kubeconfig?.contexts?.length === 1;
}

export async function saveInitParamsIfPresent() {
  const encodedParams = new URL(location).searchParams.get('init');
  if (encodedParams) {
    try {
      await setupFromParams(encodedParams);
    } catch (e) {
      alert('Error loading init params, configuration not changed.');
      console.warn(e);
    }
  }
}

async function setupFromParams(encodedParams) {
  const decoded = await encoder.decompress(encodedParams);

  if (!hasExactlyOneContext(decoded.kubeconfig)) {
    navigateToAddCluster(encodedParams);
    return;
  }

  const isKubeconfigPresent = !!Object.keys(decoded.kubeconfig || {}).length;
  const kubeconfigUser =
    decoded.kubeconfig?.users && decoded.kubeconfig?.users[0].user;

  const isOidcAuthPresent = kubeconfigUser?.exec;

  const requireMoreInput =
    !isKubeconfigPresent ||
    (!isOidcAuthPresent && !hasNonOidcAuth(kubeconfigUser));

  if (requireMoreInput) {
    navigateToAddCluster(encodedParams);
    return;
  }
  const params = {
    ...decoded,
    config: {
      ...decoded.config,
      hiddenNamespaces:
        decoded.config?.hiddenNamespaces || DEFAULT_HIDDEN_NAMESPACES,
      modules: { ...DEFAULT_MODULES, ...(decoded.config?.modules || {}) },
    },
    currentContext: {
      cluster: decoded.kubeconfig.clusters[0],
      user: decoded.kubeconfig.users[0],
    },
  };

  saveClusterParams(params);

  const clusterName = params.currentContext.cluster.name;
  saveActiveClusterName(clusterName);

  const preselectedNamespace = getCurrentContextNamespace(params.kubeconfig);
  const targetLocation =
    `/cluster/${encodeURIComponent(clusterName)}/namespaces` +
    (preselectedNamespace ? `/${preselectedNamespace}/details` : '');

  saveLocation(targetLocation);
}

function navigateToAddCluster(encodedParams) {
  // Luigi navigate doesn't work here. Simulate the Luigi's nodeParams by adding the `~`
  window.location.href =
    window.location.origin + '/clusters/add?~init=' + encodedParams;
}
