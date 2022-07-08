import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect } from 'react';
import { addByContext } from 'components/Clusters/components/addByContext';
import LuigiClient from '@luigi-project/client';

export const useLoginWithKubeconfigID = () => {
  const { getKubeconfigId, clusters } = useMicrofrontendContext();

  useEffect(() => {
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

      // LUIGI workaround: luigi performs async operations, this task must wait for the microtasks to finish
      setTimeout(() => {
        addByContext(
          getKubeconfigId,
          context,
          isOnlyOneCluster, // sets whether the cluster is active
          previousStorageMethod,
        );
      });
    });

    if (!isOnlyOneCluster) {
      // LUIGI workaround: luigi performs async operations, this task must wait for the microtasks to finish
      setTimeout(() => {
        LuigiClient.sendCustomMessage({
          id: 'busola.refreshClusters',
        });
      });
    }
  }, [getKubeconfigId, clusters]);
};
