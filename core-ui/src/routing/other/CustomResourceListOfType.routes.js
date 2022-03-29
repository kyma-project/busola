import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'react-shared/';

const CustomResourcesOfType = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesOfType'),
);

function RoutedCustomResourcesOfType() {
  const { crdName, namespaceId } = useParams();

  return (
    <Suspense fallback={<Spinner />}>
      <CustomResourcesOfType crdName={crdName} namespace={namespaceId} />
    </Suspense>
  );
}

export default (
  <>
    <Route
      path="/customresources/:crdName"
      element={<RoutedCustomResourcesOfType />}
    />
    <Route
      path="/namespaces/:namespaceId/customresources/:crdName"
      element={<RoutedCustomResourcesOfType />}
    />
  </>
);
