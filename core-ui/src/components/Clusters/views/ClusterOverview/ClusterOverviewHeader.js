import React from 'react';
import { useGet, useMicrofrontendContext, PageHeader } from 'react-shared';

export function ClusterOverviewHeader() {
  const { cluster } = useMicrofrontendContext();

  const {
    data: version,
    error: versionError,
    loading: versionLoading,
  } = useGet('/version');

  function formatClusterVersion() {
    if (versionLoading) return 'Loading...';
    if (versionError) return versionError.message;
    return version.gitVersion;
  }

  return (
    <PageHeader title="Cluster Overview">
      <PageHeader.Column title="Version">
        {formatClusterVersion()}
      </PageHeader.Column>
      <PageHeader.Column title="API server address">
        {cluster?.server}
      </PageHeader.Column>
    </PageHeader>
  );
}
