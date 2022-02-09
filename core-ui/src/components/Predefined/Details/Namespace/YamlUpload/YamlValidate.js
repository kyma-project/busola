import React from 'react';
import { useResourceType } from './useResourceType';
import { getResourceUrl } from './helpers';

export function YamlValidate({ yamlContent }) {
  const filteredResources = yamlContent?.filter(resource => resource !== null);

  const clusterWideResources = [
    '/apis/applicationconnector.kyma-project.io/v1alpha1/applications',
    '/apis/addons.kyma-project.io/v1alpha1/clusteraddonsconfigurations',
    '/apis/storage.k8s.io/v1/storageclasses',
    '/api/v1/persistentvolumes',
    '/apis/rbac.authorization.k8s.io/v1/clusterroles',
    '/apis/rbac.authorization.k8s.io/v1/clusterrolebindings',
    '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
  ];

  const urls = filteredResources?.map(resource => ({
    resource,
    url: getResourceUrl(resource), // fix s
  }));

  const resourcesWithNamespace = urls?.filter(
    resource => resource.resource.metadata.namespace,
  );
  const resourcesWithoutNamespace = urls?.filter(
    resource => !resource.resource.metadata.namespace,
  );
  const knownClusterWideResources = resourcesWithoutNamespace.filter(resource =>
    clusterWideResources.includes(resource.url),
  );
  const unknownClusterWideResources = resourcesWithoutNamespace.filter(
    resource => !clusterWideResources.includes(resource.url),
  );

  const { list } = useResourceType(unknownClusterWideResources);

  const fullList = [
    ...resourcesWithNamespace,
    ...knownClusterWideResources,
    ...list,
  ];

  return (
    <>
      You will create {fullList?.length || 0} resources:
      {fullList?.map(r => (
        <p key={`${r?.resource?.kind}-${r?.resource?.name}`}>
          - {r?.resource?.kind} {r?.resource?.name} ({r?.url})
        </p>
      ))}
    </>
  );
}
