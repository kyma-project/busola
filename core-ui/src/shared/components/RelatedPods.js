import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export const RelatedPods = ({ namespace = '', labelSelector }) => {
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods?labelSelector=${labelSelector}`,
    resourceType: 'pods',
    namespace,
    isCompact: true,
    showTitle: true,
  };

  return (
    <ComponentForList name="podsList" params={podListParams} key="pods-list" />
  );
};
