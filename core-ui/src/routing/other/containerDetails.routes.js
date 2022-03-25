import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'react-shared';

const ContainersLogs = React.lazy(() =>
  import('../../components/Predefined/Details/Pod/ContainersLogs'),
);

const RoutedContainerDetails = () => {
  const params = useParams();
  const decodedPodName = decodeURIComponent(params.podName);
  const decodedContainerName = decodeURIComponent(params.containerName);
  return (
    <ContainersLogs
      params={{
        podName: decodedPodName,
        containerName: decodedContainerName,
        namespace: params.namespaceId,
      }}
    />
  );
};

export default (
  <Route
    path={'/namespaces/:namespaceId/pods/:podName/containers/:containerName'}
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedContainerDetails />
      </Suspense>
    }
  />
);
