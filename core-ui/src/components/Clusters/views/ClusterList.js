import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext, PageHeader, GenericList } from 'react-shared';
import { setCluster, deleteCluster } from './../shared';
import { Link, Button } from 'fundamental-react';

export function ClusterList() {
  const { clusters, activeClusterName } = useMicrofrontendContext();
  if (!clusters) {
    return null;
  }

  const styleActiveCluster = entry => {
    return entry.currentContext.cluster.name === activeClusterName
      ? { fontWeight: 'bolder' }
      : {};
  };

  const entries = Object.values(clusters);
  const headerRenderer = () => ['Name', 'API Server address'];
  const textSearchProperties = [
    'currentContext.cluster.name',
    'currentContext.cluster.cluster.server',
  ];

  const rowRenderer = entry => [
    <Link
      className="link"
      style={styleActiveCluster(entry)}
      onClick={() => setCluster(entry.currentContext.cluster.name)}
    >
      {entry.currentContext.cluster.name}
    </Link>,
    entry.currentContext.cluster.cluster.server,
  ];

  const actions = [
    {
      name: 'Delete',
      handler: e => deleteCluster(e.currentContext.cluster.name),
    },
  ];

  const extraHeaderContent = (
    <Button
      option="transparent"
      glyph="add"
      className="fd-margin-begin--sm"
      onClick={() => LuigiClient.linkManager().navigate('add')}
    >
      Add Cluster
    </Button>
  );

  return (
    <>
      <PageHeader title="Clusters Overview" />
      <GenericList
        textSearchProperties={textSearchProperties}
        showSearchSuggestion={false}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        actions={actions}
        extraHeaderContent={extraHeaderContent}
        noSearchResultMessage="No clusters found"
      />
    </>
  );
}
