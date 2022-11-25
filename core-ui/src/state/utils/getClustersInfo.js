import { useRecoilState } from 'recoil';
import { useNavigate } from 'react-router-dom';

import { clusterState } from 'state/clusterAtom';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { clustersState } from 'state/clustersAtom';
import { authDataState } from 'state/authDataAtom';

export function useClustersInfo() {
  const navigate = useNavigate();

  const [currentCluster, setCurrentCluster] = useRecoilState(clusterState);
  const [currentClusterName, setCurrentClusterName] = useRecoilState(
    activeClusterNameState,
  );
  const [clusters, setClusters] = useRecoilState(clustersState);
  const [authData, setAuthData] = useRecoilState(authDataState);

  return {
    currentCluster,
    currentClusterName,
    clusters,
    authData,
    setCurrentCluster,
    setCurrentClusterName,
    setClusters,
    removeCluster: clusterName => {
      const newClustersList = { ...clusters };
      delete newClustersList[clusterName];
      setClusters(newClustersList);
      setCurrentCluster(null);
      setCurrentClusterName('');
    },
    setAuthData,
    navigate,
  };
}
