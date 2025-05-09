import { addByContext } from 'components/Clusters/shared';
import { ClustersState, clustersState } from 'state/clustersAtom';
import { SetterOrUpdater, useRecoilState, useRecoilValue } from 'recoil';
import { useEffect, useState } from 'react';
import { NavigateFunction, useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { ValidKubeconfig } from 'types';
import {
  useClustersInfo,
  useClustersInfoType,
} from 'state/utils/getClustersInfo';
import { TFunction } from 'i18next';
import { useFeature } from 'hooks/useFeature';
import { ConfigFeature } from 'state/types';
import { removePreviousPath } from 'state/useAfterInitHook';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { ClusterStorage } from 'state/types';
import {
  KubeConfigMultipleState,
  multipleContexts,
} from 'state/multipleContextsAtom';
import { useNotification } from 'shared/contexts/NotificationContext';

export interface KubeconfigIdFeature extends ConfigFeature {
  config: {
    kubeconfigUrl: string;
    showClustersOverview?: boolean; //todo
    defaultKubeconfig?: string; //todo
  };
  isEnabled: boolean;
}

function join(path: string, fileName: string) {
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path + fileName;
}

export async function loadKubeconfigById(
  kubeconfigId: string,
  kubeconfigIdFeature: KubeconfigIdFeature,
  t: TFunction,
): Promise<ValidKubeconfig> {
  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, kubeconfigId);
  const payload: any = await fetch(url)
    .then(res => res.text())
    .then(text => jsyaml.load(text));

  if (!payload || typeof payload !== 'object') {
    throw Error(t('kubeconfig-id.must-be-an-object'));
  }

  if (payload?.Error) {
    throw Error(payload.Error);
  }

  return payload;
}

const addClusters = async (
  kubeconfig: ValidKubeconfig,
  clusters: ClustersState,
  clusterInfo: useClustersInfoType,
  kubeconfigIdFeature: KubeconfigIdFeature,
  t: TFunction,
  notification?: any,
  navigate?: NavigateFunction,
) => {
  const isOnlyOneCluster = kubeconfig.contexts.length === 1;
  const currentContext = kubeconfig['current-context'];
  const showClustersOverview = kubeconfigIdFeature.config?.showClustersOverview;
  const isK8CurrentCluster = (name: string) =>
    !!currentContext && currentContext === name;
  const shouldRedirectToCluster = (name: string) =>
    !showClustersOverview && (isOnlyOneCluster || isK8CurrentCluster(name));

  try {
    kubeconfig.contexts.forEach(context => {
      const previousStorageMethod: ClusterStorage =
        clusters![context.name]?.config?.storage || 'sessionStorage';
      addByContext(
        {
          kubeconfig,
          context,
          switchCluster: shouldRedirectToCluster(context.name),
          storage: previousStorageMethod, // todo move it to config?
          config: {},
        },
        clusterInfo,
      );
    });

    if (showClustersOverview) {
      window.location.href = window.location.origin + '/clusters';
    }
  } catch (e) {
    if (notification) {
      notification.notifyError({
        content: `${t('clusters.messages.wrong-configuration')}. ${
          e instanceof Error && e?.message ? e.message : ''
        }`,
      });
    }
    if (navigate) {
      navigate('/clusters');
      removePreviousPath();
    }
    console.warn(e);
  }
};

const loadKubeconfigIdCluster = async (
  kubeconfigId: string,
  kubeconfigIdFeature: KubeconfigIdFeature,
  clusters: ClustersState,
  clusterInfo: useClustersInfoType,
  t: TFunction,
  setContextsState?: SetterOrUpdater<KubeConfigMultipleState>,
) => {
  try {
    const kubeconfig = await loadKubeconfigById(
      kubeconfigId,
      kubeconfigIdFeature!,
      t,
    );

    if (!kubeconfig?.contexts?.length) {
      return;
    }

    if (kubeconfig.contexts.length > 1 && setContextsState) {
      setContextsState(state => ({
        ...state,
        ...kubeconfig,
      }));
    } else {
      addClusters(kubeconfig, clusters, clusterInfo, kubeconfigIdFeature, t);
      return 'done';
    }
  } catch (e) {
    if (e instanceof Error) {
      alert(t('kubeconfig-id.error', { error: e.message }));
      console.warn(e);
      window.location.href = window.location.origin + '/clusters';
      removePreviousPath();
    } else {
      throw e;
    }
  }
};

export type KubeconfigIdHandleState = 'not started' | 'loading' | 'done';

export function useLoginWithKubeconfigID() {
  const kubeconfigIdFeature = useFeature<KubeconfigIdFeature>('KUBECONFIG_ID');
  const configuration = useRecoilValue(configurationAtom);
  const clusters = useRecoilValue(clustersState);
  const [contextsState, setContextsState] = useRecoilState(multipleContexts);
  const notification = useNotification();
  const navigate = useNavigate();
  const [search] = useSearchParams();
  const { t } = useTranslation();
  const clusterInfo = useClustersInfo();
  const { setCurrentCluster } = clusterInfo;
  const [handledKubeconfigId, setHandledKubeconfigId] = useState<
    KubeconfigIdHandleState
  >('not started');

  useEffect(() => {
    if (contextsState?.chosenContext) {
      const kubeconfig = {
        ...contextsState,
        contexts: contextsState.contexts.filter(
          context => context.name === contextsState.chosenContext,
        ),
        'current-context': contextsState.chosenContext,
      };
      addClusters(
        kubeconfig,
        clusters,
        clusterInfo,
        kubeconfigIdFeature,
        t,
        notification,
        navigate,
      );
      setHandledKubeconfigId('done');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextsState]);

  useEffect(() => {
    const dependenciesReady = !!configuration?.features && !!clusters;
    const flowStarted = handledKubeconfigId !== 'not started';

    if (search.get('kubeconfigID') && flowStarted) {
      setCurrentCluster(undefined);
    }

    if (!dependenciesReady || flowStarted) {
      return;
    }

    const kubeconfigId = search.get('kubeconfigID');
    if (!kubeconfigId || !kubeconfigIdFeature?.isEnabled) {
      setHandledKubeconfigId('done');
      return;
    }

    setHandledKubeconfigId('loading');
    loadKubeconfigIdCluster(
      kubeconfigId,
      kubeconfigIdFeature,
      clusters,
      clusterInfo,
      t,
      setContextsState,
    ).then(val => {
      if (val === 'done') {
        setHandledKubeconfigId('done');
      }
    });
  }, [
    contextsState,
    search,
    clusters,
    kubeconfigIdFeature,
    t,
    clusterInfo,
    handledKubeconfigId,
    configuration,
    setCurrentCluster,
    setContextsState,
  ]);

  return handledKubeconfigId;
}

export function useLoadDefaultKubeconfigId() {
  const kubeconfigIdFeature = useFeature<KubeconfigIdFeature>('KUBECONFIG_ID')!;
  const clusters = useRecoilValue(clustersState);
  const { t } = useTranslation();
  const clusterInfo = useClustersInfo();

  return async () => {
    const kubeconfigId = kubeconfigIdFeature.config.defaultKubeconfig!;

    return loadKubeconfigIdCluster(
      kubeconfigId,
      kubeconfigIdFeature,
      clusters,
      clusterInfo,
      t,
    );
  };
}
