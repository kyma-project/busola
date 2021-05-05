import React from 'react';
import LuigiClient from '@luigi-project/client';
import { useMicrofrontendContext, PageHeader, GenericList } from 'react-shared';
import { setCluster, deleteCluster } from './shared';
import { Link, Button } from 'fundamental-react';

export function ClusterList() {
  const { clusters, activeClusterName } = useMicrofrontendContext();
  if (!clusters) {
    return null;
  }

  const styleActiveCluster = entry => {
    return entry.cluster.name === activeClusterName
      ? { fontWeight: 'bolder' }
      : {};
  };

  const entries = Object.values(clusters);
  const headerRenderer = () => ['Name', 'API Server address'];
  const textSearchProperties = ['cluster.name', 'cluster.server'];

  const rowRenderer = entry => [
    <Link
      className="link"
      style={styleActiveCluster(entry)}
      onClick={() => setCluster(entry.cluster.name)}
    >
      {entry.cluster.name}
    </Link>,
    entry.cluster.server,
  ];

  const actions = [
    {
      name: 'Delete',
      handler: e => deleteCluster(e.cluster.name),
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
        noSearchResultMessage={'no nie ma klastrów i co zrobisz'}
      />
    </>
  );
}
