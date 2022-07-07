import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect } from 'react';
import { addByContext } from 'components/Clusters/components/addByContext';
import LuigiClient from '@luigi-project/client';

export const useLoginWithKubeconfigID = () => {
  const { getKubeconfigId, clusters } = useMicrofrontendContext();
  console.log(useMicrofrontendContext());
  useEffect(() => {
    const noContexts =
      !Array.isArray(getKubeconfigId?.contexts) ||
      !getKubeconfigId.contexts.length;
    if (noContexts) {
      return;
    }

    // remove old clusters
    Object.keys(clusters).forEach(clusterName =>
      LuigiClient.sendCustomMessage({
        id: 'busola.deleteCluster',
        clusterName,
      }),
    );

    // add new clusters
    const onlyOneCluster = getKubeconfigId.contexts.length === 1;
    getKubeconfigId.contexts.forEach(context => {
      addByContext(getKubeconfigId, context, onlyOneCluster);
    });
    if (!onlyOneCluster) {
      // Luigi doesn't reload when we don't choose an active cluster
      // LuigiClient.linkManager().navigate('/');
      // LuigiClient.navigation()
      LuigiClient.sendCustomMessage({
        id: 'busola.reload',
      });
      // LuigiClient.sendCustomMessage({
      //   id: 'busola.refreshNavigation',
      // });
    }
  }, [getKubeconfigId, clusters]);
};
