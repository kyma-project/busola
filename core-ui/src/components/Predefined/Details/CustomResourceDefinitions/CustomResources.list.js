import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function CustomResources(resource) {
  if (!resource) return null;
  const { group, names, versions } = resource.spec;
  const name = names.plural;
  const version = versions[0].name; //improve

  const resourceUrl = resource.metadata.namespace
    ? `/apis/${group}/${version}/namespaces/${resource.metadata.namespace}/${name}`
    : `/apis/${group}/${version}/${name}`;
  const params = {
    hasDetailsView: false,
    fixedPath: true,
    resourceUrl,
    resourceType: name,
    namespace: resource.metadata.namespace,
    isCompact: true,
    showTitle: true,
  };
  return <ComponentForList name={name} params={params} />;
}
