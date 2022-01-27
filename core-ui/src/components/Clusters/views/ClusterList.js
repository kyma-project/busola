import React, { useState } from 'react';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';

import { useShowNodeParamsError } from 'shared/hooks/useShowNodeParamsError';
import { Link, Button, MessagePage } from 'fundamental-react';
import {
  useMicrofrontendContext,
  PageHeader,
  GenericList,
  useNotification,
  Link as ExternalLink,
} from 'react-shared';

import { setCluster, deleteCluster } from './../shared';
import { AddClusterDialog } from '../components/AddClusterDialog';
import { ClusterStorageType } from './ClusterStorageType';

import './ClusterList.scss';

export function ClusterList() {
  const { clusters, activeClusterName, features } = useMicrofrontendContext();
  const notification = useNotification();
  const { t, i18n } = useTranslation();

  const [showAdd, setShowAdd] = useState(false);

  useShowNodeParamsError();

  if (!clusters) {
    return null;
  }

  const canAddCluster = !features.ADD_CLUSTER_DISABLED?.isEnabled;

  const styleActiveCluster = entry => {
    return entry.kubeconfig['current-context'] === activeClusterName
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

  // const entries = Object.values(clusters);
  const entries = Object.entries(clusters).map(([name, cluster]) => ({
    name,
    ...cluster,
  }));
  const headerRenderer = () => [
    t('common.headers.name'),
    t('clusters.common.api-server-address'),
    t('clusters.storage.title'),
  ];
  const textSearchProperties = [
    'kubeconfig.current-context',
    'currentContext.cluster.cluster.server',
  ];

  const rowRenderer = entry => [
    <>
      <Link
        className="fd-link"
        style={styleActiveCluster(entry)}
        onClick={() => setCluster(entry.name)}
      >
        {entry.name}
      </Link>
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
      name: t('common.buttons.delete'),
      icon: 'delete',
      handler: e => deleteCluster(e.kubeconfig['current-context']),
    },
  ];

  const extraHeaderContent = canAddCluster && (
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
    const btpCockpitUrl =
      features.ADD_CLUSTER_DISABLED?.config?.cockpitUrl ||
      'https://account.staging.hanavlab.ondemand.com/cockpit';

    const subtitle = canAddCluster ? (
      t('clusters.empty.subtitle')
    ) : (
      <span className="cluster-disabled-subtitle">
        {t('clusters.empty.go-to-btp-cockpit')}{' '}
        <ExternalLink
          className="fd-link"
          url={btpCockpitUrl}
          text="BTP Cockpit"
        />
      </span>
    );
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
          subtitle={subtitle}
          actions={
            canAddCluster && (
              <Button onClick={() => setShowAdd(true)}>
                {t('clusters.add.title')}
              </Button>
            )
          }
        />
      </>
    );
  }

  return (
    <>
      {dialog}
      <PageHeader title={t('clusters.overview.title-all-clusters')} />
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
