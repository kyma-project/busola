import { configureStore } from '@reduxjs/toolkit';
import isFormOpenStateReducer from './formOpenSlice';

export const store = configureStore({
  reducer: {
    isFormOpenState: isFormOpenStateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
