import { useRecoilValue } from 'recoil';
import { clusterState } from 'state/clusterAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { ValidKubeconfig } from 'types';
import { useCallback } from 'react';

export const useCreateKubeconfig = () => {
  const cluster = useRecoilValue(clusterState)!;
  const namespace = useRecoilValue(activeNamespaceIdState);
  const currentCluster = cluster.currentContext.cluster;

  const createKubeconfig = useCallback(
    (name: string, token: string): ValidKubeconfig => ({
      apiVersion: 'v1',
      kind: 'Config',
      'current-context': name,
      users: [
        {
          name: name,
          user: { token },
        },
      ],
      clusters: [currentCluster],
      contexts: [
        {
          context: {
            cluster: currentCluster.name,
            user: name,
            namespace,
          },
          name: name,
        },
      ],
    }),
    [namespace, currentCluster],
  );

  return createKubeconfig;
};
