import React from 'react';
import ServiceBindingsList from 'resources/ServiceBindings/ServiceBindingList';

export function ServiceBindingList(instance) {
  if (!instance) return null;
  const namespace = instance.metadata.namespace;
  const listParams = {
    hasDetailsView: true,
    resourceUrl: `/apis/services.cloud.sap.com/v1/namespaces/${namespace}/servicebindings`,
    resourceType: 'servicebindings',
    namespace,
    isCompact: true,
    showTitle: true,
    filter: binding =>
      binding.spec.serviceInstanceName === instance.metadata.name,
    omitColumnsIds: ['service-instance-name'],
  };
  return <ServiceBindingsList {...listParams} />;
}
