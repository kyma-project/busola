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

    // add new clusters
    const onlyOneCluster = getKubeconfigId.contexts.length === 1;

    getKubeconfigId.contexts.forEach(context => {
      const previousStorageMethod = clusters[context?.name]?.config?.storage;

      if (previousStorageMethod) {
        LuigiClient.sendCustomMessage({
          id: 'busola.deleteCluster',
          clusterName: context.name,
        });
      }
      // LUIGI workaround: 'busola.deleteCluster' cannot be waited for, but has plenty of asyncs inside, invoke after the cluster is removed
      setTimeout(() => {
        addByContext(
          getKubeconfigId,
          context,
          onlyOneCluster,
          previousStorageMethod,
        );
      });
    });

    if (!onlyOneCluster) {
      // LUIGI workaround: 'Luigi doesn't reload when we don't choose an active cluster. 'addByContext' cannot be waited for as it calls a luigi function with asyncs inside
      setTimeout(() => {
        LuigiClient.sendCustomMessage({
          id: 'busola.refreshClusters',
        });
      });
    }
  }, [getKubeconfigId, clusters]);
};
