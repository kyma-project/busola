import React, { useState } from 'react';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import { useShowNodeParamsError } from 'shared/hooks/useShowNodeParamsError';
import { Link, Button, MessagePage } from 'fundamental-react';
import { cloneDeep } from 'lodash';
import {
  useMicrofrontendContext,
  PageHeader,
  GenericList,
  useNotification,
  ModalWithForm,
  Link as ExternalLink,
  useDeleteResource,
  EMPTY_TEXT_PLACEHOLDER,
} from 'react-shared';

import { setCluster, deleteCluster } from './../shared';
import { AddClusterDialog } from '../components/AddClusterDialog';
import { ClustersEdit } from './EditCluster/EditCluster';
import { ClusterStorageType } from './ClusterStorageType';

import './ClusterList.scss';

export function ClusterList() {
  const { clusters, activeClusterName, features } = useMicrofrontendContext();
  const notification = useNotification();
  const { t, i18n } = useTranslation();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    i18n,
    resourceType: t('clusters.labels.name'),
  });

  const [chosenCluster, setChosenCluster] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editedCluster, setEditedCluster] = useState(null);

  useShowNodeParamsError();

  if (!clusters) {
    return null;
  }

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
        saveAs(blob, `kubeconfig--${entry.kubeconfig['current-context']}.yaml`);
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

  const entries = Object.entries(clusters).map(([name, cluster]) => ({
    name,
    ...cluster,
  }));
  const headerRenderer = () => [
    t('common.headers.name'),
    t('clusters.common.api-server-address'),
    t('clusters.storage.title'),
    t('common.headers.description'),
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
    entry.config.description || EMPTY_TEXT_PLACEHOLDER,
  ];

  const actions = [
    {
      name: t('common.buttons.edit'),
      icon: 'edit',
      tooltip: t('clusters.edit-cluster'),
      handler: cluster => {
        setEditedCluster(cloneDeep(cluster));
        setShowEdit(true);
      },
    },
    {
      name: t('clusters.common.download-kubeconfig'),
      icon: 'download',
      tooltip: t('clusters.common.download-kubeconfig'),
      handler: e => downloadKubeconfig(e),
    },
    {
      name: t('common.buttons.delete'),
      icon: 'delete',
      handler: resource => {
        setChosenCluster(resource);
        handleResourceDelete({
          deleteFn: () => deleteCluster(resource?.name),
        });
      },
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

  const addDialog = (
    <AddClusterDialog show={showAdd} onCancel={() => setShowAdd(false)} />
  );
  const editDialog = (
    <ModalWithForm
      opened={showEdit}
      className="modal-size--l create-resource-modal"
      title={t('clusters.edit-cluster')}
      id="edit-cluster"
      renderForm={props => (
        <ClustersEdit
          {...props}
          resource={editedCluster}
          setResource={setEditedCluster}
        />
      )}
      modalOpeningComponent={<></>}
      customCloseAction={() => setShowEdit(false)}
      confirmText={t('common.buttons.update')}
    />
  );

  if (!entries.length) {
    const subtitle = t('clusters.empty.subtitle');
    return (
      <>
        {addDialog}
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
      {addDialog}
      {editDialog}
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
      <DeleteMessageBox
        resource={chosenCluster}
        resourceName={chosenCluster?.kubeconfig['current-context']}
        deleteFn={e => deleteCluster(e.name)}
      />
    </>
  );
}
