import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  apiGroups: [],
  selfSubjectRulesReviews: [],
};

export const sharedSlice = createSlice({
  name: 'shared',
  initialState,
  reducers: {
    setData: (slice, { payload: { apiGroups, selfSubjectRulesReviews } }) => {
      slice.apiGroups = apiGroups;
      slice.selfSubjectRulesReviews = selfSubjectRulesReviews;
    },
  },
});

export const { setData } = sharedSlice.actions;

export const selectData = ({ sharedSlice }) => {
  return {
    apiGroups: sharedSlice.apiGroups,
    selfSubjectRulesReviews: sharedSlice.selfSubjectRulesReviews,
  };
};

export default sharedSlice.reducer;
