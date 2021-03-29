import React from 'react';
import LuigiClient from '@luigi-project/client';
import { serviceInstanceConstants } from 'helpers/constants';
import { Button } from 'fundamental-react';
import { PageHeader, handleDelete } from 'react-shared';
import { isService } from 'helpers';
import ServiceInstanceClassInfo from '../ServiceInstanceInfo/ServiceInstanceInfo';

const ServiceInstanceHeader = ({
  serviceInstance,
  instanceClass,
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

  const description = false //TODO
    ? instanceClass.description
    : serviceInstanceConstants.noDescription;

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
      description={description}
    >
      <ServiceInstanceClassInfo
        instanceClass={instanceClass}
        serviceInstance={serviceInstance}
      />
    </PageHeader>
  );
};

export default ServiceInstanceHeader;
