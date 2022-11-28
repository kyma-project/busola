import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';

import { clusterState } from 'state/clusterAtom';
import { clustersState } from 'state/clustersAtom';
import { authDataState } from 'state/authDataAtom';

export function useClustersInfo() {
  const navigate = useNavigate();

  const [currentCluster, setCurrentCluster] = useRecoilState(clusterState);
  const [clusters, setClusters] = useRecoilState(clustersState);
  const [authData, setAuthData] = useRecoilState(authDataState);

  return {
    currentCluster,
    clusters,
    authData,
    setCurrentCluster,
    setClusters,
    removeCluster: clusterName => {
      const newClustersList = { ...clusters };
      delete newClustersList[clusterName];
      setClusters(newClustersList);
      setCurrentCluster(null);
    },
    setAuthData,
    navigate,
  };
}
