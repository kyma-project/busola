import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CustomResourcesByGroup = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesByGroup'),
);

function RoutedCustomResourcesList() {
  const { namespaceId } = useParams();

  return <CustomResourcesByGroup namespace={namespaceId} />;
}

export default (
  <>
    <Route
      path="/customresources"
      element={
        <Suspense fallback={<Spinner />}>
          <CustomResourcesByGroup />
        </Suspense>
      }
    />
    <Route
      path="/namespaces/:namespaceId/customresources/"
      element={
        <Suspense fallback={<Spinner />}>
          <RoutedCustomResourcesList />
        </Suspense>
      }
    />
  </>
);
