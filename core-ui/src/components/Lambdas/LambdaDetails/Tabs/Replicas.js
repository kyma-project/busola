import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export default function Replicas({ name, namespace, isActive = false }) {
  const labelSelectors = `serverless.kyma-project.io/function-name=${name},serverless.kyma-project.io/resource=deployment`;
  const podListParams = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/api/v1/namespaces/${namespace}/pods?labelSelector=${labelSelectors}`,
    resourceType: 'pods',
    resourceName: 'Replicas of the Function',
    namespace: namespace,
    isCompact: true,
    showTitle: true,
    skipDataLoading: !isActive,
  };
  return <ComponentForList name="podsList" params={podListParams} />;
}
