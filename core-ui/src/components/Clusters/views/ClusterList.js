import React, { useState } from 'react';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useTranslation } from 'react-i18next';
import { useShowNodeParamsError } from 'shared/hooks/useShowNodeParamsError';
import { Link, Button, MessagePage } from 'fundamental-react';

import { useDeleteResource } from 'shared/hooks/useDeleteResource';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { ModalWithForm } from 'shared/components/ModalWithForm/ModalWithForm';
import { PageHeader } from 'shared/components/PageHeader/PageHeader';
import { GenericList } from 'shared/components/GenericList/GenericList';

import { setCluster, deleteCluster } from './../shared';
import { AddClusterDialog } from '../components/AddClusterDialog';
import { EditCluster } from './EditCluster/EditCluster';
import { ClusterStorageType } from './ClusterStorageType';

import './ClusterList.scss';
import { loadDefaultKubeconfigId } from 'components/App/useLoginWithKubeconfigID';
import { base64Decode } from 'shared/helpers';

function GARDENER_LOGIN() {
  const kubeconfigRobot = jsyaml.load(`apiVersion: v1
kind: Config
current-context: garden-hasselhoff-busola-tester
contexts:
  - name: garden-hasselhoff-busola-tester
    context:
      cluster: garden
      user: busola-tester
      namespace: garden-hasselhoff
clusters:
  - name: garden
    cluster:
      server: https://api.canary.gardener.cloud.sap
users:
  - name: busola-tester
    user:
  `);
  const kubeconfigNoRobot = jsyaml.load(`kind: Config
apiVersion: v1
clusters:
  - name: garden-kyma-dev
    cluster:
      server: https://api.canary.gardener.cloud.sap
contexts:
  - context:
      cluster: garden-kyma-dev
      user: oidc-login
      namespace: garden-kyma-dev
    name: garden-kyma-dev
current-context: garden-kyma-dev
users:
  - name: oidc-login
    user:
  `);

  const kubeconfig = kubeconfigNoRobot;

  const ssrr = {
    typeMeta: {
      kind: 'SelfSubjectRulesReview',
      aPIVersion: 'authorization.k8s.io/v1',
    },
    spec: { namespace: '*' },
  };

  const ssrUrl = `http://localhost:3001/backend/apis/authorization.k8s.io/v1/selfsubjectrulesreviews`;
  fetch(ssrUrl, {
    method: 'POST',
    body: JSON.stringify(ssrr),
    headers: {
      'Content-Type': 'application/json',
      'X-Cluster-Url': kubeconfig.clusters[0].cluster.server,
      'X-K8s-Authorization': `Bearer ${kubeconfig.users[0].user.token}`,
    },
  })
    .then(res => res.json())
    .then(res => {
      console.log('CLUSTERWIDE RESOURCE RULES', res.status.resourceRules);
      const availableProjects = [
        ...new Set(
          res.status.resourceRules
            .filter(
              r =>
                r.apiGroups.includes('core.gardener.cloud') &&
                r.resources.includes('projects') &&
                r.resourceNames,
            )
            .flatMap(r => r.resourceNames),
        ),
      ];
      console.log('AVAILABLE PROJECTS', availableProjects);

      availableProjects.forEach(project => {
        const url = `http://localhost:3001/backend/apis/core.gardener.cloud/v1beta1/namespaces/garden-${project}/shoots`;
        fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'X-Cluster-Url': kubeconfig.clusters[0].cluster.server,
            'X-K8s-Authorization': `Bearer ${kubeconfig.users[0].user.token}`,
          },
        })
          .then(res => res.json())
          .then(res => console.log('SHOOTS IN ', project, res.items));
      });

      const payload = {
        apiVersion: 'authentication.gardener.cloud/v1alpha1',
        kind: 'AdminKubeconfigRequest',
        spec: {
          expirationSeconds: 1000,
        },
      };

      const kubeconfigUrl = `http://localhost:3001/backend/apis/core.gardener.cloud/v1beta1/namespaces/${'garden-hasselhoff'}/shoots/${'kmain'}/adminkubeconfig`;
      fetch(kubeconfigUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
          'X-Cluster-Url': kubeconfig.clusters[0].cluster.server,
          'X-K8s-Authorization': `Bearer ${kubeconfig.users[0].user.token}`,
        },
      })
        .then(res => res.json())
        .then(res =>
          console.log(
            'KUBECONFIG FOR KMAIN',
            base64Decode(res.status.kubeconfig),
          ),
        );
    });
}

function ClusterList() {
  const { clusters, activeClusterName, features } = useMicrofrontendContext();
  const notification = useNotification();
  const { t } = useTranslation();

  const [DeleteMessageBox, handleResourceDelete] = useDeleteResource({
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
            deleteCluster(resource?.name);
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
      <Button
        option="transparent"
        glyph="add"
        className="fd-margin-begin--sm"
        onClick={() => setShowAdd(true)}
      >
        {t('clusters.add.title')}
      </Button>
      {features.GARDENER_LOGIN?.isEnabled && (
        <Button
          onClick={GARDENER_LOGIN}
          option="transparent"
          glyph="add"
          className="fd-margin-begin--sm"
        >
          {t('clusters.gardener.add')}
        </Button>
      )}
    </>
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

  const gardenerLoginButton = features.GARDENER_LOGIN?.isEnabled && (
    <Button onClick={GARDENER_LOGIN}>{t('clusters.gardener.add')}</Button>
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
              {gardenerLoginButton}
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
          deleteCluster(e.name);
          notification.notifySuccess({
            content: t('clusters.disconnect'),
          });
        }}
      />
    </>
  );
}

export default ClusterList;
