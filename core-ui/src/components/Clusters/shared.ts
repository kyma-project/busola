import { ActiveClusterState } from 'state/clusterAtom';
import { ClusterStorage } from 'state/types';
import {
  CurrentContext,
  Kubeconfig,
  KubeconfigContext,
  KubeconfigOIDCAuth,
  ValidKubeconfig,
} from 'types';
import { useClustersInfoType } from 'state/utils/getClustersInfo';
import { tryParseOIDCparams } from './components/oidc-params';
import { hasNonOidcAuth } from 'state/openapi/oidc';
import { createUserManager } from 'state/authDataAtom';

function addCurrentCluster(
  params: NonNullable<ActiveClusterState>,
  clustersInfo: useClustersInfoType,
) {
  const { setCurrentCluster } = clustersInfo;
  setCurrentCluster(params);

  if (params.currentContext.namespace) {
    clustersInfo.navigate(
      `/cluster/${params.contextName}/namespaces/${params.currentContext.namespace}/details`,
    );
  } else {
    clustersInfo.navigate(`/cluster/${params.contextName}`);
  }
}

export function addCluster(
  params: NonNullable<ActiveClusterState>,
  clustersInfo: useClustersInfoType,
  switchCluster = true,
) {
  const { setClusters } = clustersInfo;
  setClusters(prev => ({ ...prev, [params.contextName]: params }));
  if (switchCluster) {
    addCurrentCluster(params, clustersInfo);
  }
}

export function deleteCluster(
  clusterName: string,
  clustersInfo: useClustersInfoType,
) {
  const { setClusters } = clustersInfo;
  setClusters(prev => {
    // todo the same function when we switch cluster from oidc one
    const prevCredentials = prev?.[clusterName]?.currentContext.user.user;
    if (!hasNonOidcAuth(prevCredentials)) {
      const userManager = createUserManager(
        prevCredentials as KubeconfigOIDCAuth,
      );
      userManager.removeUser().catch(console.warn);
    }

    const newList = { ...prev };
    delete newList?.[clusterName];
    return newList;
  });
}

export function getContext(
  userKubeconfig: Kubeconfig,
  contextName: string,
): CurrentContext {
  const kubeconfig = userKubeconfig as ValidKubeconfig;

  try {
    const contexts = kubeconfig.contexts;
    const currentContextName = contextName || kubeconfig['current-context'];
    if (contexts.length === 0 || !currentContextName) {
      // no contexts or no context chosen, just take first cluster and user
      return {
        cluster: kubeconfig.clusters[0],
        user: kubeconfig.users[0],
      };
    } else {
      const { context } = contexts.find(c => c.name === currentContextName)!;
      const cluster = kubeconfig.clusters.find(
        c => c?.name === context.cluster,
      );
      if (!cluster) throw Error('cluster not found');

      const user = kubeconfig.users.find(u => u?.name === context.user);
      if (!user) throw Error('user not found');

      return { cluster, user, namespace: context.namespace };
    }
  } catch (e) {
    throw Error("Cannot 'getContext': " + e);
  }
}

export function getUserIndex(kubeconfig?: Kubeconfig) {
  const contextName = kubeconfig?.['current-context'];
  const context =
    contextName === '-all-'
      ? kubeconfig?.contexts?.[0]?.context
      : kubeconfig?.contexts?.find(c => c?.name === contextName)?.context;
  const index = kubeconfig?.users?.findIndex(u => u?.name === context?.user)!;
  return index > 0 ? index : 0;
}

export function getUser(kubeconfig: Kubeconfig) {
  const contextName = kubeconfig?.['current-context'];
  const context = kubeconfig?.contexts?.find(c => c?.name === contextName)
    ?.context;
  return kubeconfig?.users?.find(u => u?.name === context?.user)?.user;
}

export function hasKubeconfigAuth(kubeconfig: Kubeconfig) {
  try {
    const user = getUser(kubeconfig);
    if (!user) return false;

    if ('token' in user) return user.token;

    if ('client-certificate-data' in user) {
      return user['client-certificate-data'] && !!user['client-key-data'];
    }

    return tryParseOIDCparams(user as KubeconfigOIDCAuth);
  } catch (e) {
    console.warn(e);
    return false;
  }
}

export const addByContext = (
  {
    kubeconfig: userKubeconfig,
    context,
    storage = 'sessionStorage',
    switchCluster = true,
    config = {},
  }: {
    kubeconfig: Kubeconfig;
    context: KubeconfigContext;
    storage: ClusterStorage;
    switchCluster: boolean;
    config: any;
  },
  clustersInfo: useClustersInfoType,
) => {
  const kubeconfig = userKubeconfig as ValidKubeconfig;
  try {
    const cluster = kubeconfig.clusters?.find(
      c => c.name === context.context.cluster,
    );
    if (!cluster) throw Error('cluster not found');

    const user = kubeconfig.users.find(u => u.name === context.context.user);
    if (!user) throw Error('user not found');

    const newKubeconfig: ValidKubeconfig = {
      ...kubeconfig,
      'current-context': context.name,
      contexts: [context],
      clusters: [cluster],
      users: [user],
    };

    const clusterParams: NonNullable<ActiveClusterState> = {
      name: context.name,
      kubeconfig: newKubeconfig,
      contextName: context.name,
      config: { ...config, storage },
      currentContext: getContext(newKubeconfig, context.name),
    };

    addCluster(clusterParams, clustersInfo, switchCluster);
  } catch (e) {
    throw Error("Cannot 'addByContext': " + e);
  }
};
