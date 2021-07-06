import createEncoder from 'json-url';
import {
  saveClusterParams,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from '../cluster-management';
import { saveLocation } from '../navigation/previous-location';
import {
  areParamsCompatible,
  showIncompatibleParamsWarning,
} from './params-version';
import * as constants from './constants';
import { hasNonOidcAuth } from '../auth/auth';

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

  if (!areParamsCompatible(decoded.config?.version)) {
    showIncompatibleParamsWarning(decoded?.config?.version);
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
        decoded.config?.hiddenNamespaces || constants.DEFAULT_HIDDEN_NAMESPACES,
      features: {
        ...constants.DEFAULT_FEATURES,
        ...(decoded.config?.features || {}),
      },
    },
    currentContext: {
      cluster: decoded.kubeconfig.clusters[0],
      user: decoded.kubeconfig.users[0],
    },
  };

  await saveClusterParams(params);

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
