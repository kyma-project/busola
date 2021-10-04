import {
  saveClusterParams,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from '../cluster-management/cluster-management';
import { saveLocation } from '../navigation/previous-location';
import * as constants from './constants';
import { getKubeconfigById } from '../kubeconfig-id';
import { getDefaultStorage } from '../cluster-management/clusters-storage';

export function getContext(kubeconfig) {
  const contexts = kubeconfig.contexts;
  const currentContextName = kubeconfig['current-context'];
  if (contexts.length === 0 || !currentContextName) {
    // no contexts or no context chosen, just take first cluster and user
    return {
      cluster: kubeconfig.clusters[0],
      user: kubeconfig.users[0],
    };
  } else {
    const { context } = contexts.find(c => c.name === currentContextName);
    return {
      cluster: kubeconfig.clusters.find(c => c.name === context.cluster),
      user: kubeconfig.users.find(u => u.name === context.user),
    };
  }
}

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

  const kubeconfig = await getKubeconfigById(kubeconfigId);
  const params = {
    config: {
      hiddenNamespaces: constants.DEFAULT_HIDDEN_NAMESPACES,
      features: {
        ...constants.DEFAULT_FEATURES,
      },
      storage: await getDefaultStorage(),
    },
    kubeconfig,
    currentContext: getContext(kubeconfig),
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
