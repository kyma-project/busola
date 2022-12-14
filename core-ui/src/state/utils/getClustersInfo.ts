import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';

import { clusterState } from 'state/clusterAtom';
import { clustersState } from 'state/clustersAtom';

export type useClustersInfoType = ReturnType<typeof useClustersInfo>;

export function useClustersInfo() {
  const navigate = useNavigate();

  const [currentCluster, setCurrentCluster] = useRecoilState(clusterState);
  const [clusters, setClusters] = useRecoilState(clustersState);

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
