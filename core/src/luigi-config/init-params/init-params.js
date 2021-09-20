import {
  saveClusterParams,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from '../cluster-management/cluster-management';
import { saveLocation } from '../navigation/previous-location';
import {
  areParamsCompatible,
  showIncompatibleParamsWarning,
} from './params-version';
import * as constants from './constants';
import { hasNonOidcAuth } from '../auth/auth';
import { applyKubeconfigIdIfPresent } from './../kubeconfig-id';
import { getDefaultStorage } from '../cluster-management/clusters-storage';
import { getBusolaClusterParams } from '../busola-cluster-params';

const getEncoder = async () => {
  const createEncoder = (await import('json-url')).default;
  return createEncoder('lzma');
};

function hasExactlyOneContext(kubeconfig) {
  return kubeconfig?.contexts?.length === 1;
}

async function areInitParamsEnabled() {
  return (await getBusolaClusterParams()).config?.features?.INIT_PARAMS
    ?.isEnabled;
}

export async function saveQueryParamsIfPresent() {
  if (!(await areInitParamsEnabled())) {
    return;
  }
  try {
    await setupFromParams();
  } catch (e) {
    alert(
      `Error loading init params, configuration not changed (Error: ${e.message}).`,
    );
    console.warn(e);
  }
}

async function setupFromParams() {
  const searchParams = new URL(location).searchParams;
  const encodedParams = searchParams.get('init');
  const kubeconfigId = searchParams.get('kubeconfigID');
  if (!encodedParams && !kubeconfigId) {
    return;
  }

  const encoder = await getEncoder();
  const decoded = encodedParams ? await encoder.decompress(encodedParams) : {};

  await applyKubeconfigIdIfPresent(kubeconfigId, decoded);

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
      storage: await getDefaultStorage(),
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
