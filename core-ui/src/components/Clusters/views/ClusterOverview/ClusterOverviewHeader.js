import React from 'react';
import {
  useGet,
  useMicrofrontendContext,
  PageHeader,
  getErrorMessage,
} from 'react-shared';
import { ClusterStorageType } from '../ClusterStorageType';

export function ClusterOverviewHeader() {
  const { cluster, config } = useMicrofrontendContext();
  const {
    data: version,
    error: versionError,
    loading: versionLoading,
  } = useGet('/version');

  function formatClusterVersion() {
    if (versionLoading) return 'Loading...';
    if (versionError) return getErrorMessage(versionError);
    return version.gitVersion;
  }

  return (
    <PageHeader title="Cluster Overview">
      <PageHeader.Column title="Version">
        {formatClusterVersion()}
      </PageHeader.Column>
      <PageHeader.Column title="API server address">
        {cluster?.cluster.server}
      </PageHeader.Column>
      <PageHeader.Column title="Storage type">
        <ClusterStorageType clusterConfig={config} />
      </PageHeader.Column>
    </PageHeader>
  );
}
