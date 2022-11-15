import { tryParseOIDCparams } from './components/oidc-params';
import { handleAuth } from '../../state/openapi/oidc';

export function addCurrentCluster(
  params,
  setCluster,
  setCurrentClusterName,
  addAuthData,
  navigate,
) {
  setCluster(params);
  setCurrentClusterName(params.contextName);
  handleAuth(addAuthData, params, navigate);
}

export function addCluster(
  params,
  setCluster,
  setCurrentClusterName,
  updateClusters,
  addAuthData,
  navigate,
) {
  updateClusters(prev => ({ ...prev, [params.contextName]: params }));
  addCurrentCluster(
    params,
    setCluster,
    setCurrentClusterName,
    addAuthData,
    navigate,
  );
}

export function deleteCluster(clusterName, updateClusters) {
  updateClusters(prev => {
    const newList = { ...prev };
    delete newList?.[clusterName];
    return newList;
  });
}

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
  const contextName = kubeconfig?.['current-context'];
  const context =
    contextName === '-all-'
      ? kubeconfig?.contexts[0]?.context
      : kubeconfig?.contexts?.find(c => c?.name === contextName)?.context;
  const index = kubeconfig?.users?.findIndex(u => u?.name === context?.user);
  return index > 0 ? index : 0;
}

export function getUser(kubeconfig) {
  const contextName = kubeconfig?.['current-context'];
  const context = kubeconfig?.contexts?.find(c => c?.name === contextName)
    ?.context;
  return kubeconfig?.users?.find(u => u?.name === context?.user)?.user;
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

export const addByContext = (
  { kubeconfig, context, storage = 'sessionStorage', config = {} },
  addCurrentCluster,
  setCurrentClusterName,
  updateClusters,
  addAuthData,
  navigate,
) => {
  const cluster = kubeconfig.clusters.find(
    c => c.name === context.context.cluster,
  );
  const user = kubeconfig.users.find(u => u.name === context.context.user);
  const newKubeconfig = {
    ...kubeconfig,
    'current-context': context.name,
    contexts: [context],
    clusters: [cluster],
    users: [user],
  };
  addCluster(
    {
      kubeconfig: newKubeconfig,
      contextName: context.name,
      config: { ...config, storage },
      currentContext: getContext(newKubeconfig, context.name),
    },
    addCurrentCluster,
    setCurrentClusterName,
    updateClusters,
    addAuthData,
    navigate,
  );
};
