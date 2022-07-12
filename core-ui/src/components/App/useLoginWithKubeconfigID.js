import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import LuigiClient from '@luigi-project/client';
import { useComponentDidMount } from 'shared/useComponentDidMount';
import { addByContext } from 'components/Clusters/shared';

export const useLoginWithKubeconfigID = () => {
  const {
    kubeconfigIdContents: kubeconfig,
    clusters,
    features,
  } = useMicrofrontendContext();

  useComponentDidMount(() => {
    const isKubeconfigIdEnabled = features?.KUBECONFIG_ID?.isEnabled;
    const noContexts =
      !Array.isArray(kubeconfig?.contexts) || !kubeconfig.contexts.length;

    if (!isKubeconfigIdEnabled || noContexts) {
      return;
    }

    const isOnlyOneCluster = kubeconfig.contexts.length === 1;
    const k8currentCluster = kubeconfig['current-context'];
    const isShowClustersOverviewEnabled =
      features?.KUBECONFIG_ID?.config?.showClustersOverview;

    const isK8CurrentCluster = name =>
      k8currentCluster && k8currentCluster === name;
    const shouldRedirectToCluster = name =>
      isOnlyOneCluster ||
      (!isShowClustersOverviewEnabled && isK8CurrentCluster(name));

    // add the clusters
    kubeconfig.contexts.forEach(context => {
      const clusterIsPresent = clusters[context?.name];
      const previousStorageMethod = clusters[context?.name]?.config?.storage;

      if (clusterIsPresent) {
        LuigiClient.sendCustomMessage({
          id: 'busola.deleteCluster',
          clusterName: context.name,
        });
      }

      addByContext({
        kubeconfig,
        context,
        switchCluster: shouldRedirectToCluster(context.name),
        storage: previousStorageMethod,
      });
    });

    if (!isOnlyOneCluster && isShowClustersOverviewEnabled) {
      LuigiClient.sendCustomMessage({
        id: 'busola.refreshClusters',
      });
    }
  });
};
