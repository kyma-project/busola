import React from 'react';

import {
  instanceStatusColor,
  Tooltip as StatusTooltip,
} from '@kyma-project/react-components';
import { Tabs, Tab, Tooltip, GenericList } from 'react-shared';
import BindApplicationModal from './BindApplicationModal/BindApplicationModal.container';
import CreateCredentialsModal from './CreateCredentialsModal/CreateCredentialsModal.component';
import SecretDataModal from './SecretDataModal/SecretDataModal.component';
import ParametersDataModal from './ParametersDataModal/ParametersDataModal.component';
import DeleteBindingModal from './DeleteBindingModal/DeleteBindingModal.component';
import StatusIndicator from './StatusIndicator/StatusIndicator.component';

import { Spinner, StatusBadge, useGetList } from 'react-shared';
import {
  ServiceInstanceBindingsWrapper,
  SecretModalButton,
  ActionsWrapper,
} from './styled';

import { TextOverflowWrapper } from '../../ServiceInstanceList/ServiceInstanceTable/styled';

import { backendModuleExists } from 'helpers';

const ServiceInstanceBindings = ({
  serviceInstance,
  defaultActiveTabIndex,
}) => {
  const bindingsRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${serviceInstance?.metadata.namespace}/servicebindings`,
    {},
  );

  const bindingUsagesRequest = useGetList()(
    `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${serviceInstance?.metadata.namespace}/servicebindingusages`,
    {
      // pollingInterval: 2900,
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

  const getBindingCombinedData = binding => {
    const usage = bindingUsagesRequest.data.find(
      u => binding.metadata.name === u.spec.serviceBindingRef.name,
    );
    return {
      serviceBinding: binding,
      serviceBindingUsage: usage,
      secret: binding
        ? secretsRequest.data.find(
            s => s.metadata.name === binding.spec.secretName,
          )
        : undefined,
    };
  };

  const serviceBindingsCombined = bindingsRequest.data.map(
    getBindingCombinedData,
  );

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
  console.log(serviceBindingsCombined);

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
  console.log('serviceInstance', serviceInstance);
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
              <SecretModalButton data-e2e-id="secret-button">
                {secret.metadata.name}
              </SecretModalButton>
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
    // <div className="list-actions">
    //   <DeleteBindingModal
    //       deleteBindingUsage={this.props.deleteBindingUsage}
    //       bindingUsageName={bindingUsage.name}
    //       bindingUsageCount={this.countBindingUsage(bindingUsage)}
    //       id={`service-binding-delete-${bindingUsage.name}`}
    //     />
    // </div>,
  ];

  return (
    <GenericList
      key="binding-usages-list"
      title="Bound Applications"
      headerRenderer={bindingUsagesHeaderRenderer}
      entries={serviceBindingsCombined}
      rowRenderer={bindingUsagesRowRenderer}
      notFoundMessage="No applications found"
    />
  );
};

export default ServiceInstanceBindings;
