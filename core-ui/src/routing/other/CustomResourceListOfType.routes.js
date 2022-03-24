import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'react-shared/';

const CustomResourcesOfType = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesOfType'),
);

function RoutedCustomResourcesOfType() {
  const { crdName, namespaceId } = useParams();

  return <CustomResourcesOfType crdName={crdName} namespace={namespaceId} />;
}

export default (
  <>
    <Route
      path="/customresources/:crdName"
      element={
        <Suspense fallback={<Spinner />}>
          <RoutedCustomResourcesOfType />
        </Suspense>
      }
    />
    <Route
      path="/namespaces/:namespaceId/customresources/:crdName"
      element={
        <Suspense fallback={<Spinner />}>
          <RoutedCustomResourcesOfType />
        </Suspense>
      }
    />
  </>
);
