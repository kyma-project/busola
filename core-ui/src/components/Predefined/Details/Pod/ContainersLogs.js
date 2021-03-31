import React from 'react';
import { useGetStream, useWindowTitle } from 'react-shared';

export const ContainersLogs = ({ params }) => {
  return <Logs params={params} />;
};

function Logs({ params }) {
  useWindowTitle('Logs');

  const url = `/api/v1/namespaces/${params.namespace}/pods/${params.podName}/log?container=${params.containerName}&follow=true&pretty=true `;
  const { loading = true, error, data } = useGetStream(url);

  console.log(data);
  return <p>test</p>;
}
