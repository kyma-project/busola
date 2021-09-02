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
import { useTranslation } from 'react-i18next';

import { setCluster, deleteCluster } from './../shared';
import { areParamsCompatible } from '../params-version';
import './ClusterList.scss';
import { ClusterStorageType } from './ClusterStorageType';

export function ClusterList() {
  const { clusters, activeClusterName } = useMicrofrontendContext();
  const notification = useNotification();
  const { t, i18n } = useTranslation();

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
          title: t('clusters.common.kubeconfig-download-error'),
          content: e.message,
        });
      }
    } else {
      notification.notifyError({
        title: t('clusters.common.kubeconfig-download-error'),
        content: t('clusters.common.kubeconfig-not-present'),
      });
    }
  };

  const entries = Object.values(clusters);
  const headerRenderer = () => [
    t('common.headers.name'),
    t('clusters.common.api-server-address'),
    t('clusters.storage.title'),
  ];
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
        <Tooltip content={t('clusters.list.outdated.tooltip')}>
          <Icon
            ariaLabel="version incompatible warning"
            className="params-warning-icon"
            glyph="message-warning"
          />
        </Tooltip>
      )}
    </>,
    entry.currentContext.cluster.cluster.server,
    <ClusterStorageType clusterConfig={entry.config} />,
  ];

  const actions = [
    {
      name: t('clusters.common.download-kubeconfig'),
      icon: 'download',
      tooltip: t('clusters.common.download-kubeconfig'),
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
      {t('clusters.add.title')}
    </Button>
  );

  return (
    <>
      <PageHeader title={t('clusters.overview.title')} />
      <GenericList
        textSearchProperties={textSearchProperties}
        showSearchSuggestion={false}
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        actions={actions}
        extraHeaderContent={extraHeaderContent}
        noSearchResultMessage={t('clusters.list.no-clusters-found')}
        i18n={i18n}
      />
    </>
  );
}
