import { ActiveClusterState, clusterAtom } from 'state/clusterAtom';
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
import { hasNonOidcAuth, createUserManager } from 'state/authDataAtom';
import { useNavigate } from 'react-router';
import { SetStateAction, useSetAtom } from 'jotai';
import { removePreviousPath } from 'state/useAfterInitHook';
import { ManualKubeConfigIdType } from 'state/manualKubeConfigIdAtom';
import { parseOIDCparams } from 'components/Clusters/components/oidc-params';

export type Users = Array<{
  name: string;
  user: { exec: { args?: string[] }; token: string };
}>;

function addCurrentCluster(
  params: NonNullable<ActiveClusterState>,
  clustersInfo: useClustersInfoType,
) {
  const { setCurrentCluster } = clustersInfo;

  if (clustersInfo.currentCluster?.name !== params?.name) removePreviousPath();

  if (params.currentContext.namespace) {
    clustersInfo.navigate(
      `/cluster/${encodeURIComponent(params.contextName)}/namespaces/${
        params.currentContext.namespace
      }`,
    );
  } else {
    clustersInfo.navigate(`/cluster/${encodeURIComponent(params.contextName)}`);
  }

  setCurrentCluster(params);
}

export function addCluster(
  params: NonNullable<ActiveClusterState>,
  clustersInfo: useClustersInfoType,
  switchCluster = true,
) {
  const { setClusters } = clustersInfo;
  setClusters((prev) => ({ ...prev, [params.contextName]: params }));

  if (switchCluster) {
    addCurrentCluster(params, clustersInfo);
  }
}

export function deleteCluster(
  clusterName: string,
  clustersInfo: useClustersInfoType,
) {
  const { setClusters } = clustersInfo;
  setClusters((prev) => {
    // todo the same function when we switch cluster from oidc one
    const prevCredentials = prev?.[clusterName]?.currentContext.user.user;
    if (!hasNonOidcAuth(prevCredentials)) {
      const userManager = createUserManager(
        parseOIDCparams(prevCredentials as KubeconfigOIDCAuth),
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
      const { context } = contexts.find((c) => c.name === currentContextName)!;
      const cluster = kubeconfig.clusters?.find(
        (c) => c?.name === context.cluster,
      );
      if (!cluster) throw Error('cluster not found');

      const user = kubeconfig.users?.find((u) => u?.name === context.user);
      if (!user) throw Error('user not found');

      return { cluster, user, namespace: context.namespace };
    }
  } catch (e) {
    throw Error(`Unable to add context. ${e}`);
  }
}

export function getUserIndex(kubeconfig?: Kubeconfig) {
  const contextName = kubeconfig?.['current-context'];
  const context =
    contextName === '-all-'
      ? kubeconfig?.contexts?.[0]?.context
      : kubeconfig?.contexts?.find((c) => c?.name === contextName)?.context;
  const index = kubeconfig?.users?.findIndex((u) => u?.name === context?.user)!;
  return index > 0 ? index : 0;
}

export function getUser(kubeconfig: Kubeconfig) {
  const contextName = kubeconfig?.['current-context'];
  const context = kubeconfig?.contexts?.find(
    (c) => c?.name === contextName,
  )?.context;
  return kubeconfig?.users?.find((u) => u?.name === context?.user)?.user;
}

export function hasKubeconfigAuth(kubeconfig: Kubeconfig) {
  try {
    const user = getUser(kubeconfig);
    if (!user) return false;

    if ('token' in user) return user.token;

    if ('client-certificate-data' in user) {
      return user['client-certificate-data'] && !!user['client-key-data'];
    }
    const oidcData = tryParseOIDCparams(user as KubeconfigOIDCAuth);

    if (oidcData?.issuerUrl && oidcData?.clientId && oidcData?.scopes) {
      return oidcData;
    }
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
  manualKubeConfigId?: {
    manualKubeConfigId?: ManualKubeConfigIdType;
    setManualKubeConfigId?: (
      update: SetStateAction<ManualKubeConfigIdType>,
    ) => void;
  },
) => {
  let kubeconfig = userKubeconfig as ValidKubeconfig;
  const findUser = () =>
    kubeconfig.users?.find((u) => u.name === context.context.user);
  try {
    const cluster = kubeconfig.clusters?.find(
      (c) => c.name === context.context.cluster,
    );
    if (!cluster) throw Error('cluster not found');

    let user = findUser();
    let haveAuth = hasKubeconfigAuth(kubeconfig);
    const authIndex = (kubeconfig?.users as Users)?.findIndex(
      (user) => user?.user?.token || user?.user?.exec,
    );
    if (!haveAuth) {
      if (!kubeconfig.users?.length) {
        kubeconfig = {
          ...kubeconfig,
          users: [],
        };
      }
      let auth = manualKubeConfigId?.manualKubeConfigId?.auth;
      if (!auth && manualKubeConfigId?.setManualKubeConfigId) {
        manualKubeConfigId.setManualKubeConfigId?.(
          (prev: ManualKubeConfigIdType) => ({
            ...prev,
            formOpen: true,
          }),
        );
        // Return to bypass the errors and update kubeconfig in form.
        return;
      }
      if (auth) {
        kubeconfig.users = [
          ...kubeconfig.users,
          { user: { ...auth }, name: context.context.user },
        ];
        manualKubeConfigId?.setManualKubeConfigId?.(
          (prev: ManualKubeConfigIdType) => ({
            ...prev,
            auth: null,
          }),
        );
        // Update user after kubeconfig changes.
        user = findUser();
      } else if (!user && authIndex >= 0) {
        (kubeconfig?.users as Users)?.forEach((user, index) => {
          if ((user?.user?.token || user?.user?.exec) && !user?.name) {
            kubeconfig.users[index] = { ...user, name: context.context.user };
          }
        });
        // Update user after kubeconfig changes.
        user = findUser();
      } else {
        throw Error('kubeconfig does not have authentication data');
      }
    }

    if (!user) {
      throw Error('user not found');
    }

    const clusterParams: NonNullable<ActiveClusterState> = {
      name: context.name,
      kubeconfig: kubeconfig,
      contextName: context.name,
      config: { ...config, storage },
      currentContext: getContext(kubeconfig, context.name),
    };

    addCluster(clusterParams, clustersInfo, switchCluster);
  } catch (e) {
    throw Error(`Unable to add context. ${e}`);
  }
};

export function useHandleResetEndpoint() {
  const setCluster = useSetAtom(clusterAtom);
  const navigate = useNavigate();
  if (window.location.pathname === '/reset') {
    setCluster(null);
    navigate('/clusters');
  }
}
