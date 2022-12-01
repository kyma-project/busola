import React, { useState } from 'react';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import { useShowNodeParamsError } from 'shared/hooks/useShowNodeParamsError';
import { Link, Button, MessagePage } from 'fundamental-react';
import { useRecoilValue } from 'recoil';

import { configurationState } from 'state/configurationSelector';
import { useClustersInfo } from 'state/utils/getClustersInfo';

import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useNotification } from 'shared/contexts/NotificationContext';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { addCluster, deleteCluster } from './../shared';
import { AddClusterDialog } from '../components/AddClusterDialog';
import { EditCluster } from './EditCluster/EditCluster';
import { ClusterStorageType } from './ClusterStorageType';

import './ClusterList.scss';
import { loadDefaultKubeconfigId } from 'components/App/useLoginWithKubeconfigID';

function ClusterList() {
  const configuration = useRecoilValue(configurationState);
  const features = configuration?.features;

  const clustersInfo = useClustersInfo();
  const notification = useNotification();
  const { t } = useTranslation();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('clusters.labels.name'),
  });

  const [chosenCluster, setChosenCluster] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editedCluster, setEditedCluster] = useState(null);

  const { clusters, activeClusterName } = clustersInfo;

  useShowNodeParamsError();

  const styleActiveCluster = entry => {
    return entry?.kubeconfig?.['current-context'] === activeClusterName
      ? { fontWeight: 'bolder' }
      : {};
  };

  const downloadKubeconfig = entry => {
    if (entry?.kubeconfig) {
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
        onClick={() => addCluster(entry, clustersInfo)}
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
        setEditedCluster(cluster);
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
          deleteFn: () => {
            deleteCluster(resource?.name, clustersInfo);
            notification.notifySuccess({
              content: t('clusters.disconnect'),
            });
          },
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
      iconBeforeText
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
        <EditCluster {...props} editedCluster={editedCluster} />
      )}
      modalOpeningComponent={<></>}
      customCloseAction={() => setShowEdit(false)}
      confirmText={t('common.buttons.update')}
    />
  );

  const loadDefaultClusterButton = (
    <>
      {features?.KUBECONFIG_ID?.isEnabled &&
        features?.KUBECONFIG_ID?.config?.defaultKubeconfig && (
          <Button
            onClick={() => loadDefaultKubeconfigId()}
            className="fd-margin-end--tiny fd-margin-begin--tiny"
          >
            {t('clusters.add.load-default')}
          </Button>
        )}
    </>
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
            <>
              <Button
                onClick={() => setShowAdd(true)}
                className="fd-margin-end--tiny fd-margin-begin--tiny"
              >
                {t('clusters.add.title')}
              </Button>
              {loadDefaultClusterButton}
            </>
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
        entries={entries}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        actions={actions}
        extraHeaderContent={extraHeaderContent}
        sortBy={{
          name: (a, b) => a.contextName?.localeCompare(b.contextName),
        }}
        searchSettings={{
          textSearchProperties,
          showSearchSuggestion: false,
          noSearchResultMessage: t('clusters.list.no-clusters-found'),
        }}
      />
      <DeleteMessageBox
        resource={chosenCluster}
        resourceTitle={chosenCluster?.kubeconfig['current-context']}
        deleteFn={e => {
          deleteCluster(e.name, clustersInfo);
          notification.notifySuccess({
            content: t('clusters.disconnect'),
          });
        }}
      />
    </>
  );
}

export default ClusterList;
