import { useState } from 'react';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui5/webcomponents-react';
import { Link } from 'shared/components/Link/Link';

import { useClustersInfo } from 'state/utils/getClustersInfo';

import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useNotification } from 'shared/contexts/NotificationContext';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { DynamicPageComponent } from 'shared/components/DynamicPageComponent/DynamicPageComponent';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { deleteCluster } from './../shared';
import { AddClusterDialog } from '../components/AddClusterDialog';
import { EditCluster } from './EditCluster/EditCluster';
import { ClusterStorageType } from './ClusterStorageType';

import { useLoadDefaultKubeconfigId } from 'components/App/useLoginWithKubeconfigID';
import { useFeature } from 'hooks/useFeature';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

import { spacing } from '@ui5/webcomponents-react-base';
import './ClusterList.scss';
import { useSetRecoilState } from 'recoil';
import { showAddClusterWizard } from 'state/showAddClusterWizard';
import { EmptyListComponent } from 'shared/components/EmptyListComponent/EmptyListComponent';

function ClusterList() {
  const gardenerLoginFeature = useFeature('GARDENER_LOGIN');
  const kubeconfigIdFeature = useFeature('KUBECONFIG_ID');
  const loadDefaultKubeconfigId = useLoadDefaultKubeconfigId();

  const clustersInfo = useClustersInfo();
  const notification = useNotification();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
    resourceType: t('clusters.labels.name'),
  });

  const [chosenCluster, setChosenCluster] = useState(null);
  const setShowAdd = useSetRecoilState(showAddClusterWizard);

  const [toggleFormFn, getToggleFormFn] = useState(() => {});
  const [editedCluster, setEditedCluster] = useState(null);

  const { clusters, currentCluster } = clustersInfo;

  const isClusterActive = entry => {
    return (
      entry?.kubeconfig?.['current-context'] === currentCluster?.contextName
    );
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
    <Link
      design={isClusterActive(entry) ? 'Emphasized' : 'Default'}
      url={`/cluster/${entry.contextName}`}
      resetLayout={false}
    >
      {entry.name}
    </Link>,
    entry.currentContext.cluster.cluster.server,
    <ClusterStorageType clusterConfig={entry.config} />,
    entry.config?.description || EMPTY_TEXT_PLACEHOLDER,
  ];

  const actions = [
    {
      name: t('common.buttons.edit'),
      icon: 'edit',
      tooltip: t('clusters.edit-cluster'),
      handler: cluster => {
        setEditedCluster(cluster);
        toggleFormFn(true);
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
    <>
      <Button design="Transparent" icon="add" onClick={() => setShowAdd(true)}>
        {t('clusters.add.title')}
      </Button>
      {gardenerLoginFeature.isEnabled && (
        <Button
          design="Transparent"
          icon="add"
          onClick={() => navigate('/gardener-login')}
        >
          {t('clusters.gardener.button')}
        </Button>
      )}
    </>
  );

  const addDialog = <AddClusterDialog />;
  const editDialog = (
    <ModalWithForm
      getToggleFormFn={getToggleFormFn}
      className="modal-size--l"
      title={t('clusters.edit-cluster')}
      id="edit-cluster"
      renderForm={props => (
        <EditCluster {...props} editedCluster={editedCluster} />
      )}
      modalOpeningComponent={<></>}
      confirmText={t('common.buttons.update')}
    />
  );

  const loadDefaultClusterButton = (
    <>
      {kubeconfigIdFeature?.isEnabled &&
        kubeconfigIdFeature?.config?.defaultKubeconfig && (
          <Button
            onClick={loadDefaultKubeconfigId}
            style={spacing.sapUiTinyMarginBeginEnd}
          >
            {t('clusters.add.load-default')}
          </Button>
        )}
    </>
  );

  const gardenerLoginButton = gardenerLoginFeature.isEnabled && (
    <Button onClick={() => navigate('/gardener-login')}>
      {t('clusters.gardener.button')}
    </Button>
  );

  if (!entries.length) {
    return (
      <>
        {addDialog}
        <EmptyListComponent
          className="empty-cluster-list"
          titleText={t('clusters.empty.title')}
          subtitleText={t('clusters.empty.subtitle')}
          buttonText={t('common.buttons.connect')}
          url={'https://kubernetes.io/docs/concepts/overview/components/'}
          onClick={() => setShowAdd(true)}
        >
          {gardenerLoginButton}
          {loadDefaultClusterButton}
        </EmptyListComponent>
      </>
    );
  }

  return (
    <>
      {addDialog}
      {editDialog}
      <DynamicPageComponent
        title={t('clusters.overview.title-all-clusters')}
        content={
          <>
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
            {createPortal(
              <DeleteMessageBox
                resource={chosenCluster}
                resourceTitle={chosenCluster?.kubeconfig['current-context']}
                deleteFn={e => {
                  deleteCluster(e.name, clustersInfo);
                  notification.notifySuccess({
                    content: t('clusters.disconnect'),
                  });
                }}
              />,
              document.body,
            )}
          </>
        }
      />
    </>
  );
}

export default ClusterList;
