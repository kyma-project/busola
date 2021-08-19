import React from 'react';
import { ComponentForList } from 'shared/getComponents';

function ServiceBindingList(resource) {
  if (!resource) return null;

  const namespace = resource.metadata.namespace;

  const listParams = {
    hasDetailsView: false,
    fixedPath: true,
    resourceUrl: `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespace}/servicebindings`,
    resourceType: 'service-bindings',
    namespace,
    isCompact: true,
    showTitle: true,
  };
  return (
    <ComponentForList
      name="serviceBindingsList"
      params={listParams}
      key="service-binding-list"
    />
  );
}

export const ServiceInstancesDetails = ({
  DefaultRenderer,
  ...otherParams
}) => {
  const customColumns = [
    {
      header: 'Offering name',
      value: resource => resource.spec.serviceOfferingName,
    },
    {
      header: 'Plan name',
      value: resource => resource.spec.servicePlanName,
    },
    {
      header: 'External name',
      value: resource => resource.spec.externalName,
    },
  ];

  return (
    <DefaultRenderer
      customColumns={customColumns}
      customComponents={[ServiceBindingList]}
      {...otherParams}
    />
  );
};
