import React from 'react';
import LuigiClient from '@luigi-project/client';

import { ComponentForList } from 'shared/getComponents';

export function CustomResources(resource) {
  const namespace = LuigiClient.getContext().namespaceId;

  if (!resource) return null;
  const { group, names, versions } = resource.spec;
  const name = names.plural;
  const version = versions[0].name; //improve

  const resourceUrl = namespace
    ? `/apis/${group}/${version}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version}/${name}`;
  const params = {
    hasDetailsView: false,
    fixedPath: true,
    resourceUrl,
    resourceType: name,
    namespace,
    isCompact: true,
    showTitle: true,
  };
  return <ComponentForList name={name} params={params} />;
}
