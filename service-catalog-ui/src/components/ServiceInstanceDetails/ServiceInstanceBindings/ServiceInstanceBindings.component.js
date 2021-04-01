import React from 'react';
import { GenericList, handleDelete } from 'react-shared';
import CreateServiceBindingModal from './CreateServiceBindingModal/CreateServiceBindingModal';
import SecretDataModal from './SecretDataModal/SecretDataModal.component';
import { SERVICE_BINDINGS_PANEL } from './constants';
import { Link } from 'fundamental-react';
import {
  Spinner,
  StatusBadge,
  useGetList,
  useNotification,
  useDelete,
} from 'react-shared';

import { TextOverflowWrapper } from '../../ServiceInstanceList/ServiceInstanceTable/styled';
import { backendModuleExists } from 'helpers';

const ServiceInstanceBindings = ({ serviceInstance }) => {
  const notification = useNotification();
  const sendDeleteRequest = useDelete();
  const bindingsRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${serviceInstance?.metadata.namespace}/servicebindings`,
    {},
  );

  const bindingUsagesRequest = useGetList()(
    `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${serviceInstance?.metadata.namespace}/servicebindingusages`,
    {
      pollingInterval: 3000,
    },
  );

  const secretsRequest = useGetList()(
    `/api/v1/namespaces/${serviceInstance?.metadata.namespace}/secrets`,
    {
      // pollingInterval: 3300,
    },
  );

  if (
    !bindingsRequest.data ||
    !bindingUsagesRequest.data ||
    !secretsRequest.data
  )
    return <Spinner />; //TODO

  const error = !!(
    bindingsRequest.error ||
    bindingUsagesRequest.error ||
    secretsRequest.error
  );
  const loading = !!(
    bindingsRequest.loading ||
    bindingUsagesRequest.loading ||
    secretsRequest.loading
  );

  const getBindingCombinedData = bindingUsage => {
    const binding = bindingsRequest.data.find(
      b => b.metadata.name === bindingUsage.spec.serviceBindingRef.name,
    );
    return {
      serviceBinding: binding,
      serviceBindingUsage: bindingUsage,
      secret: binding
        ? secretsRequest.data.find(
            s => s.metadata.name === binding.spec.secretName,
          )
        : undefined,
    };
  };
  const serviceBindingsCombined = bindingUsagesRequest.data.map(
    getBindingCombinedData,
  );

  const capitalize = str => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // const relatedBindingUsage = bindingName => {
  //   if (!this.props.serviceInstance.serviceBindingUsages) return null;

  //   return this.props.serviceInstance.serviceBindingUsages.filter(item => {
  //     if (!item.serviceBinding) {
  //       return null;
  //     }
  //     return item.serviceBinding.name === bindingName;
  //   });
  // };

  // const { createBinding, createBindingUsage, serviceInstance } = this.props;
  // console.log('serviceBindingscombined', serviceInstance);
  // TODO take bindable from plan or service class
  // if (!serviceInstance.bindable) {
  //   return (
  //     <h4 className="fd-has-text-align-center">
  //       ServiceInstance not bindable. Binding panel not available.
  //     </h4>
  //   );
  // }

  // const bindApplication = (
  //   <BindApplicationModal
  //     createBinding={createBinding}
  //     createBindingUsage={createBindingUsage}
  //     serviceInstance={serviceInstance}
  //     id={`create-service-binding`}
  //   />
  // );

  async function handleResourceDelete({ serviceBindingUsage }) {
    console.log('deleting', serviceBindingUsage);
    return await handleDelete(
      serviceBindingUsage.kind,
      null,
      serviceBindingUsage.metadata.name,
      () => sendDeleteRequest(serviceBindingUsage.metadata.selfLink),
      () => {
        bindingUsagesRequest.silentRefetch();
        notification.notifySuccess({
          content: SERVICE_BINDINGS_PANEL.DELETE_BINDING_USAGE.SUCCESS_MESSAGE,
        });
      },
    );
  }
  const actions = [
    {
      name: 'Delete',
      handler: handleResourceDelete,
    },
  ];

  const createServiceBindingModal = (
    <CreateServiceBindingModal
      serviceInstance={serviceInstance}
      serviceBindings={bindingsRequest.data}
    />
  );

  // const boundApplicationContent = (
  //   <>
  //     <ActionsWrapper>{bindApplication}</ActionsWrapper>
  //   </>
  // );

  // const createCredentials = (
  //   <CreateCredentialsModal
  //     createBinding={createBinding}
  //     createBindingUsage={createBindingUsage}
  //     serviceInstance={serviceInstance}
  //     id={`create-credentials`}
  //   />
  // );
  // const createCredentialsContent = (
  //   <>
  //     <ActionsWrapper>{createCredentials}</ActionsWrapper>
  //   </>
  // );

  const serviceCatalogAddonsBackendModuleExists = backendModuleExists(
    'servicecatalogaddons',
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
              <Link className="link" data-e2e-id="secret-button">
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
      autoResolveType
      tooltipContent={serviceBindingUsage.status?.conditions[0].message}
    >
      {serviceBindingUsage.status?.conditions[0].reason || 'ready'}
    </StatusBadge>, //TODO enhance
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
    />
  );
};

export default ServiceInstanceBindings;
