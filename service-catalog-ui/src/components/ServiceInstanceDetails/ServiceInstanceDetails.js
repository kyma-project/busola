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
  const { namespaceId } = useMicrofrontendContext();
  const { data: serviceInstance, loading = true, error } = useGet(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${namespaceId}/serviceinstances/${match.params.name}`,
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
  console.log('instance', serviceInstance);
  const servicePlan = {
    ref:
      serviceInstance.spec.servicePlanRef?.name ||
      serviceInstance.spec.clusterServicePlanRef?.name,
    externalName:
      serviceInstance.spec.servicePlanExternalName ||
      serviceInstance.spec.clusterServicePlanExternalName,
    isClusterWide: !!serviceInstance.spec.clusterServicePlanExternalName,
  };

  // console.log(serviceInstance);

  return (
    <ThemeWrapper>
      <ServiceInstanceHeader
        serviceInstance={serviceInstance}
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
