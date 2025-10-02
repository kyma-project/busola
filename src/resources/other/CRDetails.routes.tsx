import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';

const CRDetails = React.lazy(
  () =>
    import('../../resources/CustomResourceDefinitions/CustomResources.details'),
);

type ParamsType = {
  customResourceDefinitionName: string;
  resourceVersion: string;
  resourceName: string;
};

const RoutedCRDetails = () => {
  const routerParams = useParams<ParamsType>();
  const customResourceDefinitionName = decodeURIComponent(
    routerParams.customResourceDefinitionName || '',
  );
  const resourceVersion = decodeURIComponent(
    routerParams.resourceVersion || '',
  );
  const resourceName = decodeURIComponent(routerParams.resourceName || '');

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
      'customresourcedefinitions/:customResourceDefinitionName/:resourceVersion/:resourceName'
    }
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedCRDetails />
      </Suspense>
    }
  />
);
