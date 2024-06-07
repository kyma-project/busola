import { addByContext } from 'components/Clusters/shared';
import { ClustersState, clustersState } from 'state/clustersAtom';
import { useRecoilValue } from 'recoil';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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

const loadKubeconfigIdCluster = async (
  kubeconfigId: string,
  kubeconfigIdFeature: KubeconfigIdFeature,
  clusters: ClustersState,
  clusterInfo: useClustersInfoType,
  t: TFunction,
) => {
  try {
    const kubeconfig = await loadKubeconfigById(
      kubeconfigId,
      kubeconfigIdFeature!,
      t,
    );

    if (!kubeconfig.contexts.length) {
      return;
    }

    const isOnlyOneCluster = kubeconfig.contexts.length === 1;
    const currentContext = kubeconfig['current-context'];
    const showClustersOverview =
      kubeconfigIdFeature.config?.showClustersOverview;

    const isK8CurrentCluster = (name: string) =>
      !!currentContext && currentContext === name;

    const shouldRedirectToCluster = (name: string) =>
      !showClustersOverview && (isOnlyOneCluster || isK8CurrentCluster(name));

    // add the clusters
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
  const [search] = useSearchParams();
  const { t } = useTranslation();
  const clusterInfo = useClustersInfo();
  const { setCurrentCluster } = clusterInfo;
  const [handledKubeconfigId, setHandledKubeconfigId] = useState<
    KubeconfigIdHandleState
  >('not started');

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
    ).then(() => setHandledKubeconfigId('done'));
  }, [
    search,
    clusters,
    kubeconfigIdFeature,
    t,
    clusterInfo,
    handledKubeconfigId,
    configuration,
    setCurrentCluster,
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
