import {
  saveClusterParams,
  saveActiveClusterName,
  getCurrentContextNamespace,
} from '../cluster-management/cluster-management';
import { saveLocation } from '../navigation/previous-location';
import * as constants from './constants';
import { getKubeconfigById } from '../kubeconfig-id';
import i18next from 'i18next';

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
    alert(i18next.t('kubeconfig-id.error', { error: e.message }));
    console.warn(e);
  }
}

async function setupFromParams() {
  const searchParams = new URL(location).searchParams;
  const kubeconfigId = searchParams.get('kubeconfigID');

  const kubeconfig = await getKubeconfigById(kubeconfigId);
  if (!kubeconfig) {
    return null;
  }

  const params = {
    config: {
      hiddenNamespaces: constants.DEFAULT_HIDDEN_NAMESPACES,
      features: {
        ...constants.DEFAULT_FEATURES,
      },
      // use sessionStorage for kubeconfigID clusters
      storage: 'sessionStorage',
    },
    kubeconfig,
    currentContext: getContext(kubeconfig),
  };

  await saveClusterParams(params);

  const clusterName = params.currentContext.cluster.name;
  saveActiveClusterName(clusterName);

  const preselectedNamespace = getCurrentContextNamespace(params.kubeconfig);
  const targetLocation = `/cluster/${encodeURIComponent(clusterName)}/${
    preselectedNamespace ? `${preselectedNamespace}/details` : 'overview'
  }`;

  saveLocation(targetLocation);
}
