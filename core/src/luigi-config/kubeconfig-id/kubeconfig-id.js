import {
  saveClusterParams,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from '../cluster-management/cluster-management';
import { saveLocation } from '../navigation/previous-location';
import * as constants from './constants';
import { applyKubeconfigIdIfPresent } from '../kubeconfig-id';
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

  if (!kubeconfigId) {
    return;
  }

  await applyKubeconfigIdIfPresent(kubeconfigId, decoded);

  const params = {
    config: {
      hiddenNamespaces: constants.DEFAULT_HIDDEN_NAMESPACES,
      features: {
        ...constants.DEFAULT_FEATURES,
      },
      storage: await getDefaultStorage(),
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
