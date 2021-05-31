import LuigiClient from '@luigi-project/client';

import createEncoder from 'json-url';
import { DEFAULT_MODULES } from 'react-shared';
import { merge } from 'lodash';

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

export function setCluster(clusterName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.setCluster',
    clusterName,
  });
}

export function addCluster(params) {
  const defaultParams = {
    config: {
      navigation: {
        disabledNodes: [],
        externalNodes: [],
      },
      hiddenNamespaces: [
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
      ],
      modules: DEFAULT_MODULES,
    },
  };

  params.config = {
    ...params.config,
    modules: { ...DEFAULT_MODULES, ...params?.config?.modules },
  };

  if (params.config.auth) {
    params.config.auth = {
      ...params.config.auth,
      ...getResponseParams(params.config.auth.usePKCE),
    };
  }

  LuigiClient.sendCustomMessage({
    id: 'busola.addCluster',
    params: merge(defaultParams, params),
  });
}

export function deleteCluster(clusterName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.deleteCluster',
    clusterName,
  });
}

export const decompressParams = async initParams => {
  return await encoder.decompress(initParams);
};

export function getContext(kubeconfig, contextName) {
  const contexts = kubeconfig.contexts;
  const currentContextName = contextName || kubeconfig['current-context'];
  if (contexts.length == 0 || !currentContextName) {
    // no contexts or no context choosen, just take first cluster and user
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

export function hasKubeconfigAuth(kubeconfig, contextName) {
  try {
    const context = kubeconfig.contexts.find(c => c.name === contextName)
      .context;
    const user = kubeconfig.users.find(u => u.name === context.user).user;

    const token = user.token;
    const clientCA = user['client-certificate-data'];
    const clientKeyData = user['client-key-data'];

    return !!token || (!!clientCA && !!clientKeyData);
  } catch (e) {
    // we could arduously check for falsy values, but...
    console.warn(e);
    return false;
  }
}
