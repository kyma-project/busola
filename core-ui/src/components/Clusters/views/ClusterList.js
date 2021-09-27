import React, { useState } from 'react';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import { useShowNodeParamsError } from 'shared/useShowNodeParamsError';
import { Link, Button, Icon, MessagePage } from 'fundamental-react';
import {
  useMicrofrontendContext,
  PageHeader,
  GenericList,
  useNotification,
  Tooltip,
} from 'react-shared';

import { setCluster, deleteCluster } from './../shared';
import { AddClusterDialog } from '../components/AddClusterDialog';
import { areParamsCompatible } from '../params-version';
import { ClusterStorageType } from './ClusterStorageType';

import './ClusterList.scss';

export function ClusterList() {
  const { clusters, activeClusterName } = useMicrofrontendContext();
  const notification = useNotification();
  const { t, i18n } = useTranslation();

  const [showAdd, setShowAdd] = useState(false);

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
      onClick={() => setShowAdd(true)}
    >
      {t('clusters.add.title')}
    </Button>
  );

  const dialog = (
    <AddClusterDialog show={showAdd} onCancel={() => setShowAdd(false)} />
  );

  if (!entries.length) {
    return (
      <>
        {dialog}
        <MessagePage
          className="empty-cluster-list"
          image={
            <svg role="presentation" className="fd-message-page__icon">
              <use xlinkHref="#sapIllus-Dialog-NoData"></use>
            </svg>
          }
          title={t('clusters.empty.title')}
          subtitle={t('clusters.empty.subtitle')}
          actions={
            <Button onClick={() => setShowAdd(true)}>
              {t('clusters.add.title')}
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      {dialog}
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
