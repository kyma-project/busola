import React from 'react';
import LuigiClient from '@luigi-project/client';
import { serviceInstanceConstants } from 'helpers/constants';
import { Button } from 'fundamental-react';
import {
  PageHeader,
  handleDelete,
  useGet,
  Spinner,
  useDelete,
  useNotification,
} from 'react-shared';
import { isService } from 'helpers';
import ServiceserviceClassInfo from '../ServiceInstanceInfo/ServiceInstanceInfo';

const ServiceInstanceHeader = ({ serviceInstance, servicePlan }) => {
  const deleteRequest = useDelete();
  const notificationManager = useNotification();

  const classRef =
    serviceInstance.spec.serviceClassRef?.name ||
    serviceInstance.spec.clusterServiceClassRef?.name;

  const serviceClassUrlFragment = serviceInstance.spec
    .clusterServiceClassExternalName
    ? `clusterserviceclasses`
    : `namespaces/${serviceInstance.metadata.namespace}/serviceclasses`;

  const { data: serviceClass } = useGet(
    `/apis/servicecatalog.k8s.io/v1beta1/${serviceClassUrlFragment}/${classRef}`,
    {},
  );
  if (!serviceClass) return <Spinner />;

  const preselectTabOnList = isService(
    serviceClass.spec.externalMetadata?.labels,
  )
    ? 'services'
    : 'addons';

  async function handleSubscriptionDelete(s) {
    try {
      await deleteRequest(serviceInstance.metadata.selfLink);
      notificationManager.notifySuccess({
        content: 'ServiceInstance removed succesfully',
      });

      LuigiClient.linkManager()
        .fromContext('namespaces')
        .withParams({
          selectedTab: preselectTabOnList,
        })
        .navigate('instances');
    } catch (err) {
      console.error(err);
      notificationManager.notifyError({
        content: err.message,
        autoClose: false,
      });
    }
  }

  const breadcrumbItems = [
    {
      name: `${serviceInstanceConstants.instances} - ${
        isService(serviceClass.spec.externalMetadata?.labels)
          ? 'Services'
          : 'Addons'
      }`,
      params: {
        selectedTab: preselectTabOnList,
      },
      path: '/',
    },
    {
      name: '',
    },
  ];

  const actions = (
    <Button type="negative" option="light" onClick={handleSubscriptionDelete}>
      {serviceInstanceConstants.delete}
    </Button>
  );

  return (
    <PageHeader
      breadcrumbItems={breadcrumbItems}
      title={serviceInstance.metadata.name}
      actions={actions}
      description={null} //TODO do we need it?
    >
      <ServiceserviceClassInfo
        serviceClass={serviceClass}
        serviceInstance={serviceInstance}
        servicePlan={servicePlan}
      />
    </PageHeader>
  );
};

export default ServiceInstanceHeader;
