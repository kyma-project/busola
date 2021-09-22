import LuigiClient from '@luigi-project/client';

import createEncoder from 'json-url';
import { tryParseOIDCparams } from './components/oidc-params';
import { PARAMS_VERSION } from 'react-shared';

const encoder = createEncoder('lzma');

export function setCluster(clusterName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.setCluster',
    clusterName,
  });
}

export function addCluster(params) {
  params.config.version = PARAMS_VERSION;
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

export function getUserIndex(kubeconfig) {
  console.log('getUserIndex', kubeconfig);
  const contextName = kubeconfig?.['current-context'];
  const { context } = kubeconfig?.contexts?.find(c => c.name === contextName);
  return kubeconfig?.users?.findIndex(u => u.name === context.user);
}

export function getUser(kubeconfig) {
  const contextName = kubeconfig?.['current-context'];
  const context = kubeconfig?.contexts?.find(c => c.name === contextName)
    .context;
  return kubeconfig?.users?.find(u => u.name === context.user).user;
}

export function hasKubeconfigAuth(kubeconfig) {
  try {
    const contextName = kubeconfig?.['current-context'];
    const user = getUser(kubeconfig, contextName);

    const token = user.token;
    const clientCA = user['client-certificate-data'];
    const clientKeyData = user['client-key-data'];
    const oidcParams = tryParseOIDCparams(user);

    return !!token || (!!clientCA && !!clientKeyData) || !!oidcParams;
  } catch (e) {
    // we could arduously check for falsy values, but...
    console.warn(e);
    return false;
  }
}
