import {
  saveClusterParams,
  saveActiveClusterName,
} from '../cluster-management/cluster-management';
import * as constants from './../constants';
import { loadKubeconfigById } from './loadKubeconfigById';
import i18next from 'i18next';
import * as clusterStorage from './../cluster-management/clusters-storage';

function getContext(kubeconfig) {
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

export async function handleKubeconfigIdIfPresent() {
  const searchParams = new URL(location).searchParams;
  const kubeconfigId = searchParams.get('kubeconfigID');
  try {
    const kubeconfig = await loadKubeconfigById(kubeconfigId);
    if (!kubeconfig) {
      return null;
    }

    const params = {
      config: {
        features: {
          ...constants.DEFAULT_FEATURES,
        },
      },
      kubeconfig,
      contextName: kubeconfig?.cluster?.name || '',
      currentContext: getContext(kubeconfig),
    };

    const clusterName = params.kubeconfig['current-context'];

    const existingClusterNames = Object.keys(clusterStorage.load());
    if (!existingClusterNames.includes(clusterName)) {
      // use sessionStorage for *NEW* kubeconfigID clusters
      params.config.storage = 'sessionStorage';
    }

    await saveClusterParams(params);

    const nonActiveContexts = kubeconfig.contexts.filter(el => {
      const contextName = el.name;
      return contextName !== kubeconfig['current-context'];
    });

    const saveNonActiveCluster = async el => {
      const cluster = kubeconfig.clusters.find(
        c => c.name === el.context.cluster,
      );
      const user = kubeconfig.users.find(u => u.name === el.context.user);

      const extractedKubeconfig = {
        ...kubeconfig,
        'current-context': el.name,
        contexts: [el],
        clusters: [cluster],
        users: [user],
      };

      const params = {
        kubeconfig: extractedKubeconfig,
        config: {
          storage: 'sessionStorage',
          features: {
            ...constants.DEFAULT_FEATURES,
          },
        },
        contextName: el.name,
        currentContext: {
          cluster: cluster,
          user: user,
        },
      };
      await saveClusterParams(params);
    };

    for (const context of nonActiveContexts) {
      await saveNonActiveCluster(context);
    }

    saveActiveClusterName(clusterName);
  } catch (e) {
    alert(i18next.t('kubeconfig-id.error', { error: e.message }));
    console.warn(e);
  }
}
