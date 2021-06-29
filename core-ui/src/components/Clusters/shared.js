import LuigiClient from '@luigi-project/client';

import createEncoder from 'json-url';
import { DEFAULT_MODULES, DEFAULT_HIDDEN_NAMESPACES } from 'react-shared';
import { merge } from 'lodash';
import { tryParseOIDCparams } from './components/oidc-params';

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

export function addCluster(initParams) {
  const defaultParams = {
    config: {
      navigation: {
        disabledNodes: [],
        externalNodes: [],
      },
      hiddenNamespaces: DEFAULT_HIDDEN_NAMESPACES,
      modules: DEFAULT_MODULES,
    },
  };

  const params = merge(defaultParams, initParams);
  // Don't merge hiddenNamespaces, use the defaults only when initParams are empty
  params.config.hiddenNamespaces =
    initParams.config?.hiddenNamespaces || DEFAULT_HIDDEN_NAMESPACES;

  LuigiClient.sendCustomMessage({
    id: 'busola.addCluster',
    params,
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
  if (contexts.length === 0 || !currentContextName) {
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
    const oidcParams = tryParseOIDCparams(user);

    return !!token || (!!clientCA && !!clientKeyData) || oidcParams;
  } catch (e) {
    // we could arduously check for falsy values, but...
    console.warn(e);
    return false;
  }
}
