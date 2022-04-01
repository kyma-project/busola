import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CRDetails = React.lazy(() =>
  import(
    '../../components/Predefined/Details/CustomResourceDefinitions/CustomResources.details'
  ),
);

const RoutedCRDetails = () => {
  const routerParams = useParams();
  const customResourceDefinitionName = decodeURIComponent(
    routerParams.customResourceDefinitionName,
  );
  const resourceVersion = decodeURIComponent(routerParams.resourceVersion);
  const resourceName = decodeURIComponent(routerParams.resourceName);

  const params = {
    customResourceDefinitionName,
    resourceVersion,
    resourceName,
  };
  return <CRDetails params={params} />;
};

export default (
  <Route
    path={
      '/customresourcedefinitions/:customResourceDefinitionName/:resourceVersion/:resourceName'
    }
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedCRDetails />
      </Suspense>
    }
  />
);
