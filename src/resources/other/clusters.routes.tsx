import { Suspense } from 'react';
import { Route } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

const ClusterList = lazyWithRetries(
  () => import('../../components/Clusters/views/ClusterList'),
);

export default (
  <Route
    path={'clusters'}
    element={
      <Suspense fallback={<Spinner />}>
        <ClusterList />
      </Suspense>
    }
  />
);
