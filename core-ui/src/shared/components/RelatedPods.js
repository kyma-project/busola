import React from 'react';
import { PodList } from 'resources/Pods/PodList';

export const RelatedPods = ({ namespace = '', filter }) => {
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods`,
    resourceType: 'pods',
    namespace,
    isCompact: true,
    filter,
    showTitle: true,
    disableCreate: true,
  };

  return <PodList {...podListParams} />;
};
