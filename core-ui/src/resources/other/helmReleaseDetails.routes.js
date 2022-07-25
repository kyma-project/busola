import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

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
