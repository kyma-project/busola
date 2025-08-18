import { useAtomValue } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { ValidKubeconfig } from 'types';
import { useCallback } from 'react';

export const useCreateKubeconfig = () => {
  const cluster = useAtomValue(clusterAtom)!;
  const namespace = useAtomValue(activeNamespaceIdAtom);
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
