import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { addByContext } from 'components/Clusters/components/addByContext';
import LuigiClient from '@luigi-project/client';
import { useComponentDidMount } from 'shared/useComponentDidMount';

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

    // LUIGI workaround: luigi performs async operations, this task must wait for the microtasks to finish
    if (!isOnlyOneCluster) {
      setTimeout(() => {
        LuigiClient.sendCustomMessage({
          id: 'busola.refreshClusters',
        });
      }, 50);
    }
  });
};
