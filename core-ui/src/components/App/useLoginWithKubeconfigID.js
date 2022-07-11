import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import LuigiClient from '@luigi-project/client';
import { useComponentDidMount } from 'shared/useComponentDidMount';
import { addByContext } from 'components/Clusters/shared';

export const useLoginWithKubeconfigID = () => {
  const {
    kubeconfigIdContents: kubeconfig,
    clusters,
  } = useMicrofrontendContext();

  useComponentDidMount(() => {
    const noContexts =
      !Array.isArray(kubeconfig?.contexts) || !kubeconfig.contexts.length;
    if (noContexts) {
      return;
    }
    const isOnlyOneCluster = kubeconfig.contexts.length === 1;

    // add the new clusters
    kubeconfig.contexts.forEach(context => {
      const clusterIsPresent = clusters[context?.name];
      const previousStorageMethod = clusters[context?.name]?.config?.storage;

      if (clusterIsPresent) {
        LuigiClient.sendCustomMessage({
          id: 'busola.deleteCluster',
          clusterName: context.name,
        });
      }

      addByContext(
        kubeconfig,
        context,
        isOnlyOneCluster, // sets whether the cluster is active
        previousStorageMethod,
      );
    });

    if (!isOnlyOneCluster) {
      LuigiClient.sendCustomMessage({
        id: 'busola.refreshClusters',
      });
    }
  });
};
