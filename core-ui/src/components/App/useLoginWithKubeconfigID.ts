import { addByContext } from 'components/Clusters/shared';
import { useFeature } from 'shared/hooks/useFeature';
import { clustersState } from 'state/clustersAtom';
import { useRecoilValue } from 'recoil';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsyaml from 'js-yaml';
import { ValidKubeconfig } from 'types';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { TFunction } from 'i18next';

function join(path: string, fileName: string) {
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path + fileName;
}

type KubeconfigIdFeature = {
  config: {
    kubeconfigUrl: string;
    showClustersOverview?: boolean; //todo
    defaultKubeconfig?: string; //todo
  };
  isEnabled: boolean;
};

export async function loadKubeconfigById(
  kubeconfigId: string,
  kubeconfigIdFeature: KubeconfigIdFeature,
  t: TFunction<'translation', undefined>,
): Promise<ValidKubeconfig> {
  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, kubeconfigId);
  const payload: any = await fetch(url)
    .then(res => res.text())
    .then(text => jsyaml.load(text));

  if (typeof payload !== 'object') {
    throw Error(t('kubeconfig-id.must-be-an-object'));
  }

  if (payload?.Error) {
    throw Error(payload.Error);
  }

  return payload;
}

export function useLoginWithKubeconfigID() {
  const kubeconfigIdFeature = useFeature('KUBECONFIG_ID') as
    | KubeconfigIdFeature
    | undefined;
  const clusters = useRecoilValue(clustersState);
  const [search] = useSearchParams();
  const { t } = useTranslation();
  const clusterInfo = useClustersInfo();
  const [triedGetKubeconfig, setTriedGetKubeconfig] = useState(false);

  kubeconfigIdFeature!.isEnabled = true;
  kubeconfigIdFeature!.config = {
    kubeconfigUrl: 'http://127.0.0.1:8090',
    showClustersOverview: true,
  }; // todo
  useEffect(() => {
    const loadKubeconfigIdCluster = async (kubeconfigId: string) => {
      kubeconfigIdFeature!.isEnabled = true;
      kubeconfigIdFeature!.config = {
        kubeconfigUrl: 'http://127.0.0.1:8090',

        showClustersOverview: true,
      }; // todo
      try {
        const kubeconfig = await loadKubeconfigById(
          kubeconfigId,
          kubeconfigIdFeature!,
          t,
        );

        if (!kubeconfig) {
          return null;
        }

        const noContexts =
          !Array.isArray(kubeconfig?.contexts) || !kubeconfig.contexts.length;

        if (noContexts) {
          return;
        }

        const isOnlyOneCluster = kubeconfig.contexts.length === 1;
        const k8currentCluster = kubeconfig['current-context'];
        const isShowClustersOverviewEnabled =
          kubeconfigIdFeature?.config?.showClustersOverview;

        const isK8CurrentCluster = (name: string) =>
          !!k8currentCluster && k8currentCluster === name;

        const shouldRedirectToCluster = (name: string) =>
          !isShowClustersOverviewEnabled &&
          isOnlyOneCluster &&
          !isK8CurrentCluster(name);

        // add the clusters
        kubeconfig.contexts.forEach(context => {
          const previousStorageMethod =
            clusters![context.name]?.config?.storage || '';

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
      } catch (e) {
        if (e instanceof Error) {
          alert(t('kubeconfig-id.error', { error: e.message }));
          console.warn(e);
          window.location.href = window.location.origin + '/clusters';
        } else {
          throw e;
        }
      }
    };

    const kubeconfigId = search.get('kubeconfigId');
    if (
      kubeconfigIdFeature?.isEnabled &&
      !!kubeconfigId &&
      !!clusters &&
      !triedGetKubeconfig
    ) {
      setTriedGetKubeconfig(true);
      loadKubeconfigIdCluster(kubeconfigId);
    }
  }, [
    search,
    clusters,
    kubeconfigIdFeature,
    t,
    clusterInfo,
    triedGetKubeconfig,
  ]);
}

// todo
export function loadDefaultKubeconfigId() {
  throw Error('not implemented');
}
