import React from 'react';
import LuigiClient from '@luigi-project/client';

import { ComponentForList } from 'shared/getComponents';

function CustomResource({ resource, namespace, version }) {
  const { group, names } = resource.spec;
  const name = names.plural;

  const resourceUrl = namespace
    ? `/apis/${group}/${version.name}/namespaces/${namespace}/${name}`
    : `/apis/${group}/${version.name}/${name}`;
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

export function CustomResources(resource) {
  const namespace = LuigiClient.getContext().namespaceId;

  if (!resource) return null;
  const { versions } = resource.spec;

  return (
    <>
      {versions.map(version => (
        <CustomResource
          resource={resource}
          version={version}
          namespace={namespace}
        />
      ))}
    </>
  );
}
