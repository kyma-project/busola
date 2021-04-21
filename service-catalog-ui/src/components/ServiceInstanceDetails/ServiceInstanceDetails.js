import React from 'react';
import {
  Spinner,
  useGet,
  useMicrofrontendContext,
  ResourceNotFound,
} from 'react-shared';
import ServiceInstanceHeader from './ServiceInstanceHeader/ServiceInstanceHeader';
import ServiceInstanceBindings from './ServiceInstanceBindings/ServiceInstanceBindings';
import { EmptyList } from './styled';
import { SERVICE_BINDINGS_PANEL } from './ServiceInstanceBindings/constants';

const ServiceInstanceBindingsWrapper = ({
  serviceInstance,
  servicePlanRef,
  serviceClassRef,
}) => {
  const planUrl = servicePlanRef?.isClusterWide
    ? `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceplans/${servicePlanRef.ref}`
    : `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${serviceInstance.metadata.namespace}/serviceplans/${servicePlanRef.ref}`;

  const { data: servicePlan } = useGet(planUrl, { skip: !servicePlanRef.ref });
  const classUrl = servicePlanRef?.isClusterWide
    ? `/apis/servicecatalog.k8s.io/v1beta1/clusterserviceclasses/${serviceClassRef.ref}`
    : `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${serviceInstance.metadata.namespace}/serviceclasses/${serviceClassRef.ref}`;
  const { data: serviceClass } = useGet(classUrl, {
    skip: !serviceClassRef.ref,
  });

  if (!servicePlan || !serviceClass) return null;
  return servicePlan.spec.bindable || serviceClass.spec.bindable ? (
    <ServiceInstanceBindings serviceInstance={serviceInstance} />
  ) : (
    <EmptyList>{SERVICE_BINDINGS_PANEL.NOT_BINDABLE}</EmptyList>
  );
};

export default function ServiceInstanceDetails({ match }) {
  const { namespaceId } = useMicrofrontendContext();
  const { data: serviceInstance, loading = true, error } = useGet(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances/${match.params.name}`,
    {
      pollingInterval: 3000,
    },
  );

  if (error)
    return (
      <EmptyList>
        An error occurred while loading Service Instance details
      </EmptyList>
    );

  if (loading || !serviceInstance) return <Spinner />;

  if (!serviceInstance) {
    return (
      <ResourceNotFound
        resource="Service Instance"
        breadcrumb="Instances"
        path="/"
        navigationContext="instances"
      />
    );
  }

  const servicePlanRef = {
    ref:
      serviceInstance.spec.servicePlanRef?.name ||
      serviceInstance.spec.clusterServicePlanRef?.name,
    externalName:
      serviceInstance.spec.servicePlanExternalName ||
      serviceInstance.spec.clusterServicePlanExternalName,
    isClusterWide: !!serviceInstance.spec.clusterServicePlanExternalName,
  };

  const serviceClassRef = {
    ref:
      serviceInstance.spec.serviceClassRef?.name ||
      serviceInstance.spec.clusterServiceClassRef?.name,
    externalName:
      serviceInstance.spec.serviceClassExternalName ||
      serviceInstance.spec.clusterServiceClassExternalName,
  };

  return (
    <>
      <ServiceInstanceHeader
        serviceInstance={serviceInstance}
        servicePlan={servicePlanRef}
      />
      {serviceInstance && servicePlanRef && (
        <ServiceInstanceBindingsWrapper
          serviceInstance={serviceInstance}
          servicePlanRef={servicePlanRef}
          serviceClassRef={serviceClassRef}
        />
      )}
    </>
  );
}
