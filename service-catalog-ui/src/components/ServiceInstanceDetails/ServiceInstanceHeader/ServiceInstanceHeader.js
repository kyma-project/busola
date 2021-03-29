import React from 'react';
import LuigiClient from '@luigi-project/client';
import { serviceInstanceConstants } from 'helpers/constants';
import { Button } from 'fundamental-react';
import { PageHeader, handleDelete, useGet, Spinner } from 'react-shared';
import { isService } from 'helpers';
import ServiceserviceClassInfo from '../ServiceInstanceInfo/ServiceInstanceInfo';

const ServiceInstanceHeader = ({
  serviceInstance,

  servicePlan,
  deleteServiceInstance,
}) => {
  // const deleteHandler = () =>
  //   handleDelete(
  //     'Service Instance',
  //     serviceInstance.name,
  //     serviceInstance.name,
  //     () =>
  //       deleteServiceInstance({
  //         variables: {
  //           name: serviceInstance.name,
  //           namespace: serviceInstance.namespace,
  //         },
  //       }),
  //     () =>
  //       LuigiClient.linkManager()
  //         .fromContext('namespaces')
  //         .navigate('instances'),
  //   );

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

  const breadcrumbItems = [
    {
      name: `${serviceInstanceConstants.instances} - ${
        isService(serviceInstance) ? 'Services' : 'Addons'
      }`,
      params: {
        selectedTab: isService(serviceInstance) ? 'services' : 'addons',
      },
      path: '/',
    },
    {
      name: '',
    },
  ];

  const actions = (
    <Button type="negative" option="light" onClick={_ => {}}>
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
