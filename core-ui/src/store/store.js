import { configureStore } from '@reduxjs/toolkit';
import clustersSlice from './clusters/clusters.slice';
import sharedSlice from './shared/shared.slice';

export const store = configureStore({
  reducer: {
    clustersSlice,
    sharedSlice,
  },
});
