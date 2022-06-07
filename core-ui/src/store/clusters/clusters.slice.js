import { createSlice } from '@reduxjs/toolkit';
import { loadClusters, loadCurrentClusterName } from './storage';

const initialState = {
  clusters: loadClusters(),
  currentClusterName: loadCurrentClusterName(),
};

export const clustersSlice = createSlice({
  name: 'clusters',
  initialState,
  reducers: {
    setClusters: (slice, { payload: clusters }) => {
      slice.clusters = clusters;
    },
    setCurrentCluster: (slice, { payload: clusterName }) => {
      slice.currentClusterName = clusterName;
    },
  },
});

export const { setClusters, setCurrentCluster } = clustersSlice.actions;

export const selectCurrentClusterName = ({ clustersSlice }) => {
  return clustersSlice.currentClusterName;
};

export const selectClusters = ({ clustersSlice }) => {
  return clustersSlice.clusters;
};

export const selectCurrentCluster = ({ clustersSlice }) => {
  return clustersSlice.clusters[clustersSlice.currentClusterName];
};

export default clustersSlice.reducer;
