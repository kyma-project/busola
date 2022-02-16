import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export const RelatedPods = ({ resource, filter }) => {
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${resource.metadata?.namespace}/pods`,
    resourceType: 'pods',
    namespace: resource.metadata?.namespace,
    isCompact: true,
    showTitle: true,
    filter,
  };

  return (
    <ComponentForList name="podsList" params={podListParams} key="pods-list" />
  );
};
