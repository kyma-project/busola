import React, { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { Spinner } from 'react-shared';

const HelmReleasesList = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesList'),
);

export default (
  <Route
    path={'/namespaces/:namespaceId/helm-releases'}
    element={
      <Suspense fallback={<Spinner />}>
        <HelmReleasesList />
      </Suspense>
    }
  />
);
