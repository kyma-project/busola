import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { addByContext } from 'components/Clusters/components/addByContext';
import LuigiClient from '@luigi-project/client';
import { useComponentDidMount } from 'shared/useComponentDidMount';

export const useLoginWithKubeconfigID = () => {
  const { getKubeconfigId, clusters } = useMicrofrontendContext();

  useComponentDidMount(() => {
    const noContexts =
      !Array.isArray(getKubeconfigId?.contexts) ||
      !getKubeconfigId.contexts.length;
    if (noContexts) {
      return;
    }
    const isOnlyOneCluster = getKubeconfigId.contexts.length === 1;

    // add the new clusters
    getKubeconfigId.contexts.forEach(context => {
      const clusterIsPresent = clusters[context?.name];
      const previousStorageMethod = clusters[context?.name]?.config?.storage;

      if (clusterIsPresent) {
        LuigiClient.sendCustomMessage({
          id: 'busola.deleteCluster',
          clusterName: context.name,
        });
      }

      addByContext(
        getKubeconfigId,
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
