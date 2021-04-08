import React from 'react';
import {
  useGetStream,
  useWindowTitle,
  PageHeader,
  Spinner,
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
  const streamData = useGetStream(url);

  const Logs = ({ streamData }) => {
    const { loading, error, data } = streamData;
    if (error) return error.message;
    if (loading) return <Spinner />;
    return data?.map((arr, idx) => (
      <div className="logs" key={idx}>
        {arr}
      </div>
    ));
  };
  return (
    <>
      <PageHeader
        title={params.containerName}
        breadcrumbItems={breadcrumbs}
      ></PageHeader>
      <Logs streamData={streamData} />
    </>
  );
}
