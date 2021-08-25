import React from 'react';
import LuigiClient from '@luigi-project/client';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { Link, Button, Icon } from 'fundamental-react';
import { useShowNodeParamsError } from 'shared/useShowNodeParamsError';
import {
  useMicrofrontendContext,
  PageHeader,
  GenericList,
  useNotification,
  Tooltip,
} from 'react-shared';

import { setCluster, deleteCluster } from './../shared';
import { areParamsCompatible } from '../params-version';
import './ClusterList.scss';

export function ClusterList() {
  const { clusters, activeClusterName } = useMicrofrontendContext();
  const notification = useNotification();

  useShowNodeParamsError();

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
    <>
      <Link
        className="fd-link"
        style={styleActiveCluster(entry)}
        onClick={() => setCluster(entry.currentContext.cluster.name)}
      >
        {entry.currentContext.cluster.name}
      </Link>
      {!areParamsCompatible(entry.config?.version) && (
        <Tooltip content="Outdated parameter version may cause errors. Delete and re-add your cluster.">
          <Icon
            ariaLabel="version incompatible warning"
            className="params-warning-icon"
            glyph="message-warning"
          />
        </Tooltip>
      )}
    </>,
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
