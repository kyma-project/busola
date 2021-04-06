import React from 'react';
import {
  useGetStream,
  useWindowTitle,
  GenericList,
  PageHeader,
} from 'react-shared';

export const ContainersLogs = ({ params }) => {
  return <Logs params={params} />;
};

function Logs({ params }) {
  useWindowTitle('Logs');

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&tailLines=1000`;
  const { loading = true, error, data } = useGetStream(url);

  const breadcrumbs = [
    {
      name: 'Pods',
      path: '/',
      fromAbsolutePath: false,
    },
    {
      name: params.podName,
      path: `/details/${params.podName}`,
      fromAbsolutePath: false,
    },
    { name: '' },
  ];

  const headerRenderer = () => [];
  const rowRenderer = entry => [entry];

  return (
    <>
      <PageHeader
        title={params.containerName}
        breadcrumbItems={breadcrumbs}
      ></PageHeader>
      <GenericList
        title="Logs"
        entries={data || []}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        serverDataError={error}
        serverErrorMessage={error?.message}
        serverDataLoading={loading}
      />
    </>
  );
}
