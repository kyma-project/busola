import React from 'react';
import {
  useGetStream,
  useWindowTitle,
  GenericList,
  PageHeader,
} from 'react-shared';
import './ContainersLogs.scss';

export const ContainersLogs = ({ params }) => {
  return <Logs params={params} />;
};

function Logs({ params }) {
  useWindowTitle('Logs');

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

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&tailLines=1000&timestamps=true`;
  const { loading = true, error, data } = useGetStream(url);

  return (
    <>
      <PageHeader
        title={params.containerName}
        breadcrumbItems={breadcrumbs}
      ></PageHeader>
      {data?.map(arr => (
        <div className="logs">{arr}</div>
      ))}
    </>
  );
}
