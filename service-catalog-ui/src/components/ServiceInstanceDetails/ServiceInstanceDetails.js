import React from 'react';

import { ThemeWrapper } from '@kyma-project/react-components';

import {
  Spinner,
  useGet,
  useMicrofrontendContext,
  ResourceNotFound,
} from 'react-shared';

import ServiceInstanceHeader from './ServiceInstanceHeader/ServiceInstanceHeader';
// import ServiceInstanceBindings from './ServiceInstanceBindings/ServiceInstanceBindings.container';
// import { serviceInstanceConstants } from 'helpers/constants';

import { ServiceInstanceWrapper, EmptyList } from './styled';

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

  if (loading || !serviceInstance) {
    return (
      <EmptyList>
        <Spinner />
      </EmptyList>
    );
  }

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

  const servicePlan = {
    ref:
      serviceInstance.spec.servicePlanRef?.name ||
      serviceInstance.spec.clusterServicePlanRef?.name,
    externalName:
      serviceInstance.spec.servicePlanExternalName ||
      serviceInstance.spec.clusterServicePlanExternalName,
    isClusterWide: !!serviceInstance.spec.clusterServicePlanExternalName,
  };

  return (
    <ThemeWrapper>
      <ServiceInstanceHeader
        serviceInstance={serviceInstance}
        servicePlan={servicePlan}
        // deleteServiceInstance={deleteServiceInstanceMutation}
      />
      <ServiceInstanceWrapper>
        {/* // <ServiceInstanceBindings
          //   defaultActiveTabIndex={serviceInstanceConstants.addonsIndex}
          //   serviceInstance={serviceInstance}
          // /> */}

        {/* {serviceClass && backendModuleExists('rafter') && ( // this was used to display the documentation
          <ServiceInstanceTabs
            serviceClass={serviceClass}
            currentPlan={serviceInstance.servicePlan}
          />
        )} */}
      </ServiceInstanceWrapper>
    </ThemeWrapper>
  );
}
