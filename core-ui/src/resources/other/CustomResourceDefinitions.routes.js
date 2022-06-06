import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CRDList = React.lazy(() =>
  import('../../components/CustomResources/CRDList'),
);

export default (
  <Route
    path="customresourcedefinitions"
    element={
      <Suspense fallback={<Spinner />}>
        <CRDList />
      </Suspense>
    }
  />
);
