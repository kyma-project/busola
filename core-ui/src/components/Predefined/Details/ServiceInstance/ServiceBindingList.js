import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function ServiceBindingList(instance) {
  if (!instance) return null;

  const namespace = instance.metadata.namespace;

  const listParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespace}/servicebindings`,
    resourceType: 'servicebindings',
    namespace,
    isCompact: true,
    showTitle: true,
    filter: binding =>
      binding.spec.serviceInstanceName === instance.metadata.name,
    omitColumnsIds: ['service-instance-name'],
  };
  return (
    <ComponentForList
      name="serviceBindingsList"
      params={listParams}
      key="instance-binding-list"
    />
  );
}
