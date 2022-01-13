import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function ResourcePods(resource, _, showNodeName) {
  if (!resource) return null;
  const labelSelectors = Object.entries(
    resource.spec?.selector?.matchLabels || resource.metadata.labels,
  )
    .map(([key, value]) => `${key}=${value}`)
    .join(',');

  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${resource.metadata.namespace}/pods?labelSelector=${labelSelectors}`,
    resourceType: 'pods',
    namespace: resource.metadata.namespace,
    isCompact: true,
    showTitle: true,
    showNodeName,
  };
  return (
    <ComponentForList
      name="podsList"
      params={podListParams}
      key="deployment-pods"
    />
  );
}
