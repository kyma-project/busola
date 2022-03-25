import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'react-shared';

const ClusterList = React.lazy(() =>
  import('../../components/Clusters/views/ClusterList'),
);

export default (
  <Route
    path={'/clusters'}
    element={
      <Suspense fallback={<Spinner />}>
        <ClusterList />
      </Suspense>
    }
  />
);
