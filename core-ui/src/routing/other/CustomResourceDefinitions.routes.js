import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'react-shared/';

const CRDList = React.lazy(() =>
  import('../../components/CustomResources/GroupingList'),
);

export default (
  <Route
    path="/customresourcedefinitions"
    element={
      <Suspense fallback={<Spinner />}>
        <CRDList />
      </Suspense>
    }
  />
);
