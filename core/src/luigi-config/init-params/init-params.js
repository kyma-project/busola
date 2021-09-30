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
import { applyKubeconfigIdIfPresent } from './../kubeconfig-id';
import { getDefaultStorage } from '../cluster-management/clusters-storage';

export async function saveQueryParamsIfPresent() {
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
  const kubeconfigId = searchParams.get('kubeconfigID');

  // neither params nor kk-id
  if (!kubeconfigId) {
    return;
  }

  // no kk-id, params present but disabled
  if (!kubeconfigId) {
    return;
  }

  const decoded = {};

  await applyKubeconfigIdIfPresent(kubeconfigId, decoded);

  if (!areParamsCompatible(decoded.config?.version)) {
    showIncompatibleParamsWarning(decoded?.config?.version);
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
