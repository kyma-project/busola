import React from 'react';
import { GenericList, handleDelete } from 'react-shared';
import CreateServiceBindingModal from './CreateServiceBindingModal/CreateServiceBindingModal';
import SecretDataModal from './SecretDataModal/SecretDataModal.component';
import { Link } from 'fundamental-react';
import {
  StatusBadge,
  useGetList,
  useNotification,
  useDelete,
  useMicrofrontendContext,
} from 'react-shared';
import { useTranslation } from 'react-i18next';

import { TextOverflowWrapper } from '../../ServiceInstanceList/ServiceInstanceTable/styled';

const ServiceInstanceBindings = ({ serviceInstance, i18n }) => {
  const { t } = useTranslation();

  const { features } = useMicrofrontendContext();
  const btpCatalogEnabled = features.BTP_CATALOG?.isEnabled;
  const filterBindingsForInstance = binding =>
    binding?.spec.instanceRef?.name === serviceInstance.metadata.name;
  const notification = useNotification();
  const sendDeleteRequest = useDelete();
  const bindingsRequest = useGetList(
    filterBindingsForInstance,
  )(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${serviceInstance?.metadata.namespace}/servicebindings`,
    { pollingInterval: 3000 },
  );

  const bindingUsagesRequest = useGetList()(
    `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${serviceInstance?.metadata.namespace}/servicebindingusages`,
    {
      pollingInterval: 3200,
    },
  );

  const secretsRequest = useGetList()(
    `/api/v1/namespaces/${serviceInstance?.metadata.namespace}/secrets`,
    { pollingInterval: 5000 },
  );

  const error = !!(
    bindingsRequest.error ||
    bindingUsagesRequest.error ||
    secretsRequest.error ||
    !bindingsRequest.data ||
    !bindingUsagesRequest.data ||
    !secretsRequest.data
  );
  const loading = !!(
    bindingsRequest.loading ||
    bindingUsagesRequest.loading ||
    secretsRequest.loading
  );

  const getBindingCombinedData = binding => {
    const bindingUsages = (bindingUsagesRequest.data || []).filter(
      u => binding.metadata.name === u.spec.serviceBindingRef.name,
    );
    const secret = (secretsRequest.data || []).find(
      s => s.metadata.name === binding.spec.secretName,
    );

    if (bindingUsages.length)
      return bindingUsages.map(usage => ({
        serviceBinding: binding,
        serviceBindingUsage: usage,
        secret,
      }));

    return null;
  };
  const serviceBindingsCombined = (bindingsRequest.data || [])
    .flatMap(getBindingCombinedData)
    .filter(d => d);

  const capitalize = str => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  async function handleResourceDelete({ serviceBindingUsage }) {
    return await handleDelete(
      serviceBindingUsage.kind,
      null,
      serviceBindingUsage.metadata.name,
      notification,
      () =>
        sendDeleteRequest(
          `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${serviceBindingUsage.metadata.namespace}/servicebindingusages/${serviceBindingUsage.metadata.name}`,
        ),
      () => {
        bindingUsagesRequest.silentRefetch();
        notification.notifySuccess({
          content: 'Service Binding Usage deleted',
        });
      },
      t,
    );
  }
  const actions = btpCatalogEnabled
    ? []
    : [
        {
          name: t('common.buttons.delete'),
          icon: 'delete',
          handler: handleResourceDelete,
        },
      ];

  const createServiceBindingModal = (
    <CreateServiceBindingModal
      serviceInstance={serviceInstance}
      serviceBindings={bindingsRequest.data}
      i18n={i18n}
    />
  );

  const bindingUsagesHeaderRenderer = () => [
    'Service Binding Usage',
    'Bound Applications',
    'Service Binding',
    'Secret',
    'Status',
  ];
  const bindingUsagesRowRenderer = ({
    serviceBinding,
    serviceBindingUsage,
    secret,
  }) => [
    <TextOverflowWrapper>
      <span
        data-e2e-id="binding-name"
        title={serviceBindingUsage.metadata.name}
      >
        {serviceBindingUsage.metadata.name}
      </span>
    </TextOverflowWrapper>,
    (_ => {
      const text = `${serviceBindingUsage.spec.usedBy?.name} (${capitalize(
        serviceBindingUsage.spec.usedBy?.kind,
      )})`;

      return (
        <TextOverflowWrapper>
          <span title={text}>{text}</span>
        </TextOverflowWrapper>
      );
    })(),
    (_ => {
      return (
        serviceBinding && (
          <TextOverflowWrapper>
            <span title={serviceBinding.metadata.name}>
              {serviceBinding.metadata.name}
            </span>
          </TextOverflowWrapper>
        )
      );
    })(),
    (_ => {
      const prefix = serviceBindingUsage.spec.parameters?.envPrefix?.name;

      return secret && Object.keys(secret).length ? (
        <TextOverflowWrapper>
          <SecretDataModal
            title={`Secret ${secret.metadata.name}`}
            modalOpeningComponent={
              <Link className="fd-link" data-e2e-id="secret-button">
                {secret.metadata.name}
              </Link>
            }
            data={secret.data}
            prefix={prefix}
          />
        </TextOverflowWrapper>
      ) : (
        '-'
      );
    })(),
    <StatusBadge
      type={
        serviceBindingUsage.status?.conditions[0].reason
          ? serviceBindingUsage.status?.conditions[0].reason
              .toUpperCase()
              .includes('ERROR')
            ? 'error'
            : 'info'
          : 'success'
      }
      tooltipContent={serviceBindingUsage.status?.conditions[0].message}
    >
      {serviceBindingUsage.status?.conditions[0].reason || 'ready'}
    </StatusBadge>,
  ];

  return (
    <GenericList
      key="binding-usages-list"
      title="Bound Applications"
      headerRenderer={bindingUsagesHeaderRenderer}
      extraHeaderContent={createServiceBindingModal}
      entries={serviceBindingsCombined}
      rowRenderer={bindingUsagesRowRenderer}
      notFoundMessage="No applications found"
      actions={actions}
      serverDataError={error}
      serverDataLoading={loading}
      textSearchProperties={[
        'serviceBindingUsage.metadata.name',
        'serviceBinding.metadata.name',
        'serviceBindingUsage.spec.usedBy.name',
      ]}
      i18n={i18n}
    />
  );
};

export default ServiceInstanceBindings;
