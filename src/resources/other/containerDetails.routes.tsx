import React, { Suspense } from 'react';
import { Route, useParams } from 'react-router';
import { Spinner } from 'shared/components/Spinner/Spinner';

const ContainersLogs = React.lazy(() => import('../Pods/ContainersLogs'));

type ParamsType = {
  podName: string;
  containerName: string;
  namespaceId: string;
};

const RoutedContainerDetails = () => {
  const params = useParams<ParamsType>();
  const decodedPodName = decodeURIComponent(params.podName || '');
  const decodedContainerName = decodeURIComponent(params.containerName || '');
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
    path={'pods/:podName/containers/:containerName'}
    element={
      <Suspense fallback={<Spinner />}>
        <RoutedContainerDetails />
      </Suspense>
    }
  />
);
