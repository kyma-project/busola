import React from 'react';
import { useGetStream, useWindowTitle, GenericList } from 'react-shared';

export const ContainersLogs = ({ params }) => {
  return <Logs params={params} />;
};

function Logs({ params }) {
  useWindowTitle('Logs');

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true`;
  const { loading = true, error, data } = useGetStream(url);
  const logs = [...data]?.reverse();

  const headerRenderer = () => [];
  const rowRenderer = entry => [<p>{entry}</p>];

  return (
    <GenericList
      title="Logs"
      entries={logs || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverErrorMessage={error?.message}
      serverDataLoading={loading}
      pagination={{ itemsPerPage: 50, autoHide: true }}
    />
  );
}
