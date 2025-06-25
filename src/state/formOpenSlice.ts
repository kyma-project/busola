import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './store';

export interface IsFormOpenState {
  formOpen?: boolean;
  leavingForm?: boolean;
}

const initialState: IsFormOpenState = { formOpen: false, leavingForm: false };

export const counterSlice = createSlice({
  name: 'isFormOpenState',
  initialState,
  reducers: {
    setIsFormOpenState: (state, action: PayloadAction<IsFormOpenState>) => {
      if (action.payload.formOpen !== undefined) {
        state.formOpen = action.payload.formOpen;
      }
      if (action.payload.leavingForm !== undefined) {
        state.leavingForm = action.payload.leavingForm;
      }
    },
  },
});

export const { setIsFormOpenState } = counterSlice.actions;
export const getIsFormOpenState = (state: RootState) => state.isFormOpenState;
export default counterSlice.reducer;
