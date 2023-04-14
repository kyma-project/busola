import ClusterValidation from 'components/ClusterValidation/ClusterValidation';
import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const ClusterList = React.lazy(() =>
  import('../../components/Clusters/views/ClusterList'),
);

export default (
  <Route
    path={'cluster-validation'}
    element={
      <Suspense fallback={<Spinner />}>
        <ClusterValidation />
      </Suspense>
    }
  />
);
