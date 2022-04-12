import React from 'react';
import ServiceBindingsList from 'resources/ServiceBindings/ServiceBindingList';
import { useTranslation } from 'react-i18next';
export function ServiceBindingList(instance) {
  const { i18n } = useTranslation();
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
    i18n,
  };
  return <ServiceBindingsList {...listParams} />;
}
