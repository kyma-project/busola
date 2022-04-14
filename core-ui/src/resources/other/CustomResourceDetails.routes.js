import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CustomResource = React.lazy(() =>
  import('../CustomResourceDefinitions/CustomResources.details'),
);

function RoutedCRDDetails() {
  const { crdName, crName } = useParams();

  return (
    <Suspense fallback={<Spinner />}>
      <CustomResource
        params={{
          customResourceDefinitionName: crdName,
          resourceName: crName,
        }}
      />
    </Suspense>
  );
}

export default (
  <>
    <Route
      path="/namespaces/:namespaceId/customresources/:crdName/:crName"
      element={<RoutedCRDDetails />}
    />
    <Route
      path="/customresources/:crdName/:crName"
      element={<RoutedCRDDetails />}
    />
  </>
);
