import { useNavigate } from 'react-router';

import { clusterAtom } from 'state/clusterAtom';
import { clustersAtom } from 'state/clustersAtom';
import { useAtom } from 'jotai';

export type useClustersInfoType = ReturnType<typeof useClustersInfo>;

export function useClustersInfo() {
  const navigate = useNavigate();

  const [currentCluster, setCurrentCluster] = useAtom(clusterAtom);
  const [clusters, setClusters] = useAtom(clustersAtom);

  return {
    currentCluster,
    clusters,
    setCurrentCluster,
    setClusters,
    removeCluster: (clusterName: string) => {
      const newClustersList = { ...clusters };
      delete newClustersList[clusterName];
      setClusters(newClustersList);
      setCurrentCluster(null);
    },
    navigate,
  };
}
