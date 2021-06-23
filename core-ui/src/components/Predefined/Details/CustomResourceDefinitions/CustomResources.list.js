import React from 'react';
import LuigiClient from '@luigi-project/client';

import { ComponentForList } from 'shared/getComponents';

function CustomResource({ resource, namespace, version }) {
  const { group, names } = resource.spec;
  const name = names.plural;

  const resourceUrl = namespace
    ? `/apis/${group}/${version}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version}/${name}`;

  const navigateFn = resourceName => {
    LuigiClient.linkManager()
      .fromClosestContext()
      .navigate(`${version}/${resourceName}`);
  };

  const params = {
    hasDetailsView: true,
    navigateFn,
    resourceUrl,
    resourceType: name,
    namespace,
    isCompact: true,
    showTitle: true,
    title: `${name} - ${version}`,
  };

  return <ComponentForList name={name} params={params} />;
}

export function CustomResources(resource) {
  const namespace = LuigiClient.getContext().namespaceId;

  if (!resource) return null;
  const { versions } = resource.spec;

  return (
    <>
      {versions.map(version => (
        <CustomResource
          resource={resource}
          version={version.name}
          namespace={namespace}
        />
      ))}
    </>
  );
}
