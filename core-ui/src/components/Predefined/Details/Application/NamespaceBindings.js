import React from 'react';

import CreateBindingModal from './CreateBindingModal/CreateBindingModal';
import EditNamespaceBinding from './EditNamespaceBinding';
import ServicesBoundModal from './ServicesBoundModal';
import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useNotification } from 'shared/contexts/NotificationContext';
import { handleDelete } from 'shared/components/GenericList/actionHandlers/simpleDelete';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { useTranslation } from 'react-i18next';

export default function NamespaceBindings(application) {
  const { t, i18n } = useTranslation();

  const deleteRequest = useDelete();
  const notification = useNotification();

  const { metadata, spec } = application;
  const { data, loading, error, silentRefetch } = useGetList(
    aM => aM.metadata.name === metadata.name,
  )('/apis/applicationconnector.kyma-project.io/v1alpha1/applicationmappings', {
    pollingInterval: 3000,
  });

  const headerRenderer = () => [
    t('common.headers.name'),
    t('applications.headers.service-and-event'),
  ];
  const totalBindingsCount = (spec.services || []).flatMap(s => s.entries)
    .length;
  const alreadyBoundNamespaces = data?.map(aM => aM.metadata.namespace) || [];

  const rowRenderer = binding => [
    <ServicesBoundModal binding={binding} appSpec={spec} />,
    `${
      binding.spec?.services?.length >= 0
        ? binding.spec.services.length
        : totalBindingsCount
    }/${totalBindingsCount}`,
  ];

  const actions = [
    {
      name: t('common.buttons.edit'),
      icon: 'edit',
      component: binding => (
        <EditNamespaceBinding binding={binding} application={application} />
      ),
    },
    {
      name: t('common.buttons.delete'),
      icon: 'delete',
      handler: binding =>
        handleDelete(
          t('applications.bindings'),
          null,
          binding.metadata.name,
          notification,
          () =>
            deleteRequest(
              `/apis/applicationconnector.kyma-project.io/v1alpha1/namespaces/${binding.metadata.namespace}/applicationmappings/${binding.metadata.name}`,
            ),
          () => {
            silentRefetch();
            notification.notifySuccess({
              content: t('applications.messages.binding-deleted'),
            });
          },
          t,
        ),
    },
  ];

  return (
    <GenericList
      key="application-bindings"
      extraHeaderContent={
        <CreateBindingModal
          application={application}
          alreadyBoundNamespaces={alreadyBoundNamespaces}
        />
      }
      actions={actions}
      title={t('applications.subtitle.namespace-bindings')}
      showSearchField={false}
      entries={data || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={error}
      serverDataLoading={loading}
      notFoundMessage={t('applications.messages.binding-not-found')}
      i18n={i18n}
    />
  );
}
