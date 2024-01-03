import React, { Suspense } from 'react';
import { Route, useParams, useSearchParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CustomResourcesOfType = React.lazy(() =>
  import('../../components/CustomResources/CustomResourcesOfType'),
);

function RoutedCustomResourcesOfType() {
  const { crdName } = useParams();
  let [searchParams, setSearchParams] = useSearchParams();

  return (
    <Suspense fallback={<Spinner />}>
      <CustomResourcesOfType crdName={crdName} />
    </Suspense>
  );
}

export default (
  <Route
    path="customresources/:crdName"
    element={<RoutedCustomResourcesOfType />}
  />
);
