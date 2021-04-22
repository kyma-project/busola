import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Button } from 'fundamental-react';
import {
  Tooltip,
  Spinner,
  ModalWithForm,
  useGetList,
  useGet,
  useMicrofrontendContext,
  ResourceNotFound,
} from 'react-shared';

import './ServiceClassDetails.scss';
import { getResourceDisplayName, isStringValueEqualToTrue } from 'helpers';
import { createInstanceConstants } from 'helpers/constants';
import CreateInstanceForm from './CreateInstanceForm/CreateInstanceForm';
import ServiceClassDetailsHeader from './ServiceClassDetailsHeader/ServiceClassDetailsHeader';
import ServiceClassInstancesTable from './ServiceClassInstancesTable/ServiceClassInstancesTable';
import { sortByDisplayName } from 'helpers/sorting';

export default function ServiceClassDetails({ name }) {
  const { namespaceId } = useMicrofrontendContext();
  const { resourceType } = LuigiClient.getNodeParams();

  const serviceClassUrl = `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceclasses/${name}`;
  const clusterServiceClassUrl = `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceclasses/${name}`;

  const { data: serviceClass, loading = true, error } = useGet(
    resourceType === 'ClusterServiceClass'
      ? clusterServiceClassUrl
      : serviceClassUrl,
    {
      pollingInterval: 3000,
      skip: !resourceType,
    },
  );

  const resourceTypeLowercase =
    resourceType?.charAt(0).toLowerCase() + resourceType?.slice(1);
  const label =
    serviceClass?.metadata.labels['servicecatalog.k8s.io/spec.externalID'];
  const labelSelector = `?labelSelector=servicecatalog.k8s.io/spec.${resourceTypeLowercase}Ref.name%3D${label}`;
  const { data: serviceInstances } = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances${labelSelector}`,
    {
      pollingInterval: 3200,
    },
  );

  const servicePlansUrl = `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceplans${labelSelector}`;
  const clusterServicePlansUrl = `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceplans${labelSelector}`;
  const plansUrl =
    resourceType === 'ClusterServiceClass'
      ? clusterServicePlansUrl
      : servicePlansUrl;
  const servicePlansRequest = useGetList()(plansUrl, {
    pollingInterval: 3500,
  });
  const servicePlans = servicePlansRequest.data?.sort(sortByDisplayName);

  if (error) {
    return (
      <ResourceNotFound
        resource={resourceType}
        breadcrumb="Catalog"
        path="/"
        fromClosestContext={true}
      />
    );
  }

  if (loading || !serviceClass) {
    return <Spinner />;
  }

  const serviceClassDisplayName = getResourceDisplayName(serviceClass);
  const isActivated = serviceInstances?.length > 0;

  const isProvisionedOnlyOnce =
    serviceClass.spec.externalMetadata?.labels &&
    isStringValueEqualToTrue(
      serviceClass.spec.externalMetadata.labels.provisionOnlyOnce,
    );

  const modalOpeningComponent = (
    <Tooltip content={createInstanceConstants.provisionOnlyOnceInfo}>
      <Button disabled={isProvisionedOnlyOnce && isActivated} glyph="add">
        {isProvisionedOnlyOnce
          ? isActivated
            ? createInstanceConstants.buttonText.provisionOnlyOnceActive
            : createInstanceConstants.buttonText.provisionOnlyOnce
          : createInstanceConstants.buttonText.standard}
      </Button>
    </Tooltip>
  );

  return (
    <>
      <ServiceClassDetailsHeader serviceClass={serviceClass}>
        <ModalWithForm
          title={`Provision the ${serviceClassDisplayName}${' '}
                  ${
                    resourceType === 'ClusterServiceClass'
                      ? 'Cluster Service Class'
                      : 'Service Class'
                  }${' '}
                  in the ${namespaceId} Namespace`}
          modalOpeningComponent={modalOpeningComponent}
          id="add-instance-modal"
          item={serviceClass}
          renderForm={props => (
            <CreateInstanceForm
              {...props}
              plans={servicePlans || []}
              documentationUrl={
                serviceClass.spec.externalMetadata?.documentationUrl
              }
            />
          )}
        />
      </ServiceClassDetailsHeader>
      <ServiceClassInstancesTable instanceList={serviceInstances} />
    </>
  );
}
