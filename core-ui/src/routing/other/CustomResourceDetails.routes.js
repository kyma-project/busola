import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'react-shared/';

const CustomResource = React.lazy(() =>
  import(
    '../../components/Predefined/Details/CustomResourceDefinitions/CustomResources.details'
  ),
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
