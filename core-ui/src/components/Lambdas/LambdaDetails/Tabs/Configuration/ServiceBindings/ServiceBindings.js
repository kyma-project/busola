import React from 'react';
import LuigiClient from '@luigi-project/client';

import { useDelete } from 'shared/hooks/BackendAPI/useMutation';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link } from 'fundamental-react';
import { useTranslation } from 'react-i18next';

import CreateServiceBindingModal from './CreateServiceBindingModal';
import { SERVICE_BINDINGS_PANEL, ERRORS } from 'components/Lambdas/constants';

import './ServiceBindings.scss';

const headerRenderer = () => ['Instance', 'Environment Variable Names'];
const textSearchProperties = ['serviceBinding.spec.instanceRef.name']; //TODO support searching by env name

export default function ServiceBindings({
  lambda = {},
  serviceBindingsCombined,
  serverDataError,
  serverDataLoading,
}) {
  const { t, i18n } = useTranslation();
  const notification = useNotification();
  const { namespaceId } = useMicrofrontendContext();

  const deleteServiceBindingUsage = useDelete();
  const serviceBindingsWithUsages = serviceBindingsCombined.filter(
    ({ serviceBindingUsage }) => serviceBindingUsage,
  );
  const renderEnvs = (secret, prefix = '') => {
    if (!secret) return ''; // don't display if secret not present
    return (
      <>
        {Object.keys(secret.data).map(k => (
          <div key={k}>
            {prefix}
            {k}
          </div>
        ))}
      </>
    );
  };

  async function handleServiceBindingUsageDelete({ serviceBindingUsage: sbu }) {
    const url = `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${namespaceId}/servicebindingusages/${sbu.metadata.name}`;
    try {
      await deleteServiceBindingUsage(url);
      notification.notifySuccess({
        content: 'Service Binding Usage deleted',
      });
    } catch (e) {
      console.error(e);
      notification.notifyError({
        title: 'Failed to delete the Service Binding Usage',
        content: e.message,
      });
    }
  }

  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled =
    features.BTP_CATALOG?.isEnabled &&
    features.SERVICE_CATALOG_READ_ONLY?.isReadOnly;
  const actions = btpCatalogEnabled
    ? []
    : [
        {
          name: t('common.buttons.delete'),
          icon: 'delete',
          handler: handleServiceBindingUsageDelete,
        },
      ];
  const rowRenderer = ({ secret, serviceBinding, serviceBindingUsage }) => [
    <Link
      className="fd-link"
      data-test-id="service-instance-name"
      onClick={() =>
        LuigiClient.linkManager()
          .fromContext('namespace')
          .navigate(`instances/details/${serviceBinding.spec.instanceRef.name}`)
      }
    >
      {serviceBinding.spec.instanceRef.name}
    </Link>,
    renderEnvs(secret, serviceBindingUsage.spec.parameters?.envPrefix.name),
  ];

  const createServiceBindingModal = (
    <CreateServiceBindingModal
      lambda={lambda}
      serviceBindingsCombined={serviceBindingsCombined}
      i18n={i18n}
    />
  );

  return (
    <GenericList
      title={SERVICE_BINDINGS_PANEL.LIST.TITLE}
      textSearchProperties={textSearchProperties}
      showSearchField={true}
      showSearchSuggestion={false}
      extraHeaderContent={createServiceBindingModal}
      actions={actions}
      entries={serviceBindingsWithUsages}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      serverDataError={serverDataError}
      serverDataLoading={serverDataLoading}
      notFoundMessage={SERVICE_BINDINGS_PANEL.LIST.ERRORS.RESOURCES_NOT_FOUND}
      noSearchResultMessage={
        SERVICE_BINDINGS_PANEL.LIST.ERRORS.NOT_MATCHING_SEARCH_QUERY
      }
      serverErrorMessage={t(ERRORS.SERVER)}
      i18n={i18n}
    />
  );
}
