import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  selectClusters,
  selectCurrentClusterName,
  selectCurrentCluster,
  setCurrentCluster,
  setClusters,
} from './clusters.slice';
import * as storage from './storage';

export function useClusters() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const clusters = useSelector(selectClusters);
  const currentCluster = useSelector(selectCurrentCluster);
  const currentClusterName = useSelector(selectCurrentClusterName);

  const setCluster = clusterName => {
    dispatch(setCurrentCluster(clusterName));
    storage.saveClusterName(clusterName);
    navigate(`/cluster/${clusterName}/overview`);
  };

  return {
    clusters,
    currentCluster,
    currentClusterName,
    setCluster,
    addCluster: cluster => {
      const nextClusters = { ...clusters, [cluster.contextName]: cluster };
      dispatch(setClusters(nextClusters));
      storage.saveClusters(nextClusters);
      setCluster(cluster.contextName);
    },
    removeCluster: clusterName => {
      const nextClusters = { ...clusters };
      delete nextClusters[clusterName];
      dispatch(setClusters(nextClusters));
      storage.saveClusters(nextClusters);
      setCluster(null);
    },
  };
}
