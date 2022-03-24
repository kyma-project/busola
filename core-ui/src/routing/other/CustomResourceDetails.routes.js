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
    <CustomResource
      params={{
        customResourceDefinitionName: crdName,
        resourceName: crName,
      }}
    />
  );
}

export default (
  <>
    <Route
      path="/namespaces/:namespaceId/customresources/:crdName/:crName"
      element={
        <Suspense fallback={<Spinner />}>
          <RoutedCRDDetails />
        </Suspense>
      }
    />
    <Route
      path="/customresources/:crdName/:crName"
      element={
        <Suspense fallback={<Spinner />}>
          <RoutedCRDDetails />
        </Suspense>
      }
    />
  </>
);
