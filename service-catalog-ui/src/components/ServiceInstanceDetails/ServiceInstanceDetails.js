import React, { useEffect } from 'react';
import LuigiClient from '@luigi-project/client';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { createBrowserHistory } from 'history';

import {
  NotificationMessage,
  ThemeWrapper,
} from '@kyma-project/react-components';

import {
  Tooltip,
  Spinner,
  ModalWithForm,
  useGetList,
  useGet,
  useMicrofrontendContext,
  ResourceNotFound,
} from 'react-shared';

import ServiceInstanceHeader from './ServiceInstanceHeader/ServiceInstanceHeader';
import ServiceInstanceTabs from './ServiceInstanceTabs/ServiceInstanceTabs.component';
import ServiceInstanceBindings from './ServiceInstanceBindings/ServiceInstanceBindings.container';
import { serviceInstanceConstants } from 'helpers/constants';

import { ServiceInstanceWrapper, EmptyList } from './styled';
import { backendModuleExists } from 'helpers';
import { getServiceInstanceDetails } from 'helpers/instancesGQL/queries';
import {
  SERVICE_BINDING_EVENT_SUBSCRIPTION,
  SERVICE_BINDING_USAGE_EVENT_SUBSCRIPTION,
  SERVICE_INSTANCE_EVENT_SUBSCRIPTION,
} from 'helpers/instancesGQL/subscriptions';
import {
  handleInstanceEventOnDetails,
  handleServiceBindingEvent,
  handleServiceBindingUsageEvent,
} from 'helpers/instancesGQL/events';
import { deleteServiceInstance } from 'helpers/instancesGQL/mutations';

export default function ServiceInstanceDetails({ match }) {
  const history = createBrowserHistory();
  const { data: serviceInstance, loading = true, error } = useGet(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/orders-service/serviceinstances/${match.params.name}`,
    {
      pollingInterval: 3000,
    },
  );

  // const [deleteServiceInstanceMutation] = useMutation(deleteServiceInstance);

  if (error)
    return (
      <EmptyList>
        An error occurred while loading Service Instance details
      </EmptyList>
    );

  if (loading) {
    return (
      <EmptyList>
        <Spinner />
      </EmptyList>
    );
  }

  const serviceClass = serviceInstance && {
    ref:
      serviceInstance.spec.serviceClassRef?.name ||
      serviceInstance.spec.clusterServiceClassRef?.name,
    externalName:
      serviceInstance.spec.serviceClassExternalName ||
      serviceInstance.spec.clusterServiceClassExternalName,
    isClusterWide: !!serviceInstance.spec.clusterServiceClassExternalName,
  };

  const servicePlan = serviceInstance && {
    ref:
      serviceInstance.spec.servicePlanRef?.name ||
      serviceInstance.spec.clusterServicePlanRef?.name,
    externalName:
      serviceInstance.spec.servicePlanExternalName ||
      serviceInstance.spec.clusterServicePlanExternalName,
    isClusterWide: !!serviceInstance.spec.clusterServicePlanExternalName,
  };

  console.log(serviceInstance);

  if (!serviceInstance || !serviceClass) {
    return (
      <ResourceNotFound
        resource="Service Instance"
        breadcrumb="Instances"
        path="/"
        navigationContext="instances"
      />
    );
  }

  return (
    <ThemeWrapper>
      <ServiceInstanceHeader
        serviceInstance={serviceInstance}
        serviceClass={serviceClass}
        servicePlan={servicePlan}
        // deleteServiceInstance={deleteServiceInstanceMutation}
        history={history}
      />
      <ServiceInstanceWrapper>
        {/* <ServiceInstanceBindings
          defaultActiveTabIndex={serviceInstanceConstants.addonsIndex}
          serviceInstance={serviceInstance}
        />
        {serviceClass && backendModuleExists('rafter') && (
          <ServiceInstanceTabs
            serviceClass={serviceClass}
            currentPlan={serviceInstance.servicePlan}
          />
        )} */}
      </ServiceInstanceWrapper>
      <NotificationMessage
        type="error"
        title={serviceInstanceConstants.error}
        message={error && error.message}
      />
    </ThemeWrapper>
  );
}
