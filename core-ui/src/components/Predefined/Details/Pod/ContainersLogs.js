import React from 'react';
import { LayoutPanel } from 'fundamental-react';
import { useGetStream, useWindowTitle, PageHeader } from 'react-shared';
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

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&tailLines=1000`;
  const streamData = useGetStream(url);

  const LogsPanel = ({ streamData, containerName }) => {
    const { error, data } = streamData;
    if (error) return error.message;
    if (data?.length === 0)
      return (
        <div className="empty-logs">
          No logs avaliable for the '{containerName}' container.
        </div>
      );

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
      <LayoutPanel className="fd-margin--md">
        <LayoutPanel.Header>
          <LayoutPanel.Head title="Logs" />
        </LayoutPanel.Header>
        <LayoutPanel.Body>
          <LogsPanel
            streamData={streamData}
            containerName={params.containerName}
          />
        </LayoutPanel.Body>
      </LayoutPanel>
    </>
  );
}
