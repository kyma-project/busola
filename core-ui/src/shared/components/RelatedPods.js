import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export const RelatedPods = ({ resource, labelSelector }) => {
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${resource.metadata.namespace}/pods?labelSelector=${labelSelector}`,
    resourceType: 'pods',
    namespace: resource.metadata?.namespace,
    isCompact: true,
    showTitle: true,
  };

  return (
    <ComponentForList name="podsList" params={podListParams} key="pods-list" />
  );
};
