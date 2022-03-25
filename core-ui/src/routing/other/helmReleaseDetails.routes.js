import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'react-shared';

const HelmReleaseDetails = React.lazy(() =>
  import('../../components/HelmReleases/HelmReleasesDetails'),
);

const RoutedHelmReleaseDetails = () => {
  const { releaseName } = useParams();
  return <HelmReleaseDetails releaseName={releaseName} />;
};

export default (
  <Route
    path={'/namespaces/:namespaceId/helm-releases/:releaseName'}
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedHelmReleaseDetails />
      </Suspense>
    }
  />
);
