import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const AppServiceDetails = React.lazy(() =>
  import(
    'resources/Applications/ApplicationServicesDetails/ApplicationServicesDetails'
  ),
);

const RoutedAppServiceDetails = () => {
  const params = useParams();
  const applicationName = decodeURIComponent(params.name);
  const serviceName = decodeURIComponent(params.serviceName);
  return (
    <>
      <AppServiceDetails
        applicationName={applicationName}
        serviceName={serviceName}
      />
    </>
  );
};

export default (
  <Route
    path={'/applications/:name/:serviceName'}
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedAppServiceDetails />
      </Suspense>
    }
  />
);
