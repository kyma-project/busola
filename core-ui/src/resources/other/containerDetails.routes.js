import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router-dom';
import { Spinner } from 'shared/components/Spinner/Spinner';

const ContainersLogs = React.lazy(() => import('../Pods/ContainersLogs'));

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
