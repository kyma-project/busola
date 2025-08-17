import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router';

import { clusterState } from 'state/clusterAtom';
import { clustersState } from 'state/clustersAtom';
import { useAtom } from 'jotai';

export type useClustersInfoType = ReturnType<typeof useClustersInfo>;

export function useClustersInfo() {
  const navigate = useNavigate();

  const [currentCluster, setCurrentCluster] = useRecoilState(clusterState);
  const [clusters, setClusters] = useAtom(clustersState);

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
