import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const HelmReleasesList = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesList'),
);

export default (
  <Route
    path={'helm-releases'}
    element={
      <Suspense fallback={<Spinner />}>
        <HelmReleasesList />
      </Suspense>
    }
  />
);
