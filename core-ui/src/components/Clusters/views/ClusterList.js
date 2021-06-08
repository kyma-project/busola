import React from 'react';
import LuigiClient from '@luigi-project/client';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { Link, Button } from 'fundamental-react';
import {
  useMicrofrontendContext,
  PageHeader,
  GenericList,
  useNotification,
} from 'react-shared';

import { setCluster, deleteCluster } from './../shared';

export function ClusterList() {
  const { clusters, activeClusterName } = useMicrofrontendContext();
  const notification = useNotification();
  if (!clusters) {
    return null;
  }

  const styleActiveCluster = entry => {
    return entry.currentContext.cluster.name === activeClusterName
      ? { fontWeight: 'bolder' }
      : {};
  };

  const downloadKubeconfig = entry => {
    if (entry.kubeconfig) {
      try {
        const kubeconfigYaml = jsyaml.dump(entry.kubeconfig);
        const blob = new Blob([kubeconfigYaml], {
          type: 'application/yaml;charset=utf-8',
        });
        saveAs(blob, 'kubeconfig.yaml');
      } catch (e) {
        console.error(e);
        notification.notifyError({
          title: 'Failed to download the Kubeconfig',
          content: e.message,
        });
      }
    } else {
      notification.notifyError({
        title: 'Failed to download the Kubeconfig',
        content: 'Kubeconfig is missing on the Cluster',
      });
    }
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
      name: 'Download Kubeconfig',
      icon: 'download',
      tooltip: 'Download Kubeconfig',
      handler: e => downloadKubeconfig(e),
    },
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
