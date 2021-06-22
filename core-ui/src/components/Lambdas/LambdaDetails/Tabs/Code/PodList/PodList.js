import React from 'react';
import LuigiClient from '@luigi-project/client';
import { GenericList, useGetList } from 'react-shared';
import { Link, Button } from 'fundamental-react';
import './PodList.scss';

const navigateTo = path => _ =>
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(path);

export default function PodList({ namespace, functionName }) {
  const labelSelectors = `serverless.kyma-project.io/function-name=${functionName},serverless.kyma-project.io/resource=deployment`;
  const resourceUrl = `/api/v1/namespaces/${namespace}/pods?labelSelector=${labelSelectors}`;
  const { data: pods, error, loading = true } = useGetList()(resourceUrl, {
    pollingInterval: 4000,
  });

  const headerRenderer = () => ['Name', 'Logs'];

  const rowRenderer = entry => [
    <Link
      className="link"
      onClick={navigateTo(`pods/details/${entry.metadata.name}`)}
    >
      {entry.metadata.name}
    </Link>,
    <Button
      onClick={navigateTo(
        `pods/details/${entry.metadata.name}/containers/function`,
      )}
      glyph="form"
    >
      View logs
    </Button>,
  ];

  return (
    <GenericList
      className="pods-of-function"
      showSearchField={false}
      compact
      title="Replicas of the Function"
      entries={pods || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverErrorMessage={error?.message}
      serverDataLoading={loading}
    />
  );
}
