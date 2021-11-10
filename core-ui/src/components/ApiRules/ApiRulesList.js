import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function ApiRulesList({ resourceName, namespace }) {
  const params = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${namespace}/apirules`,
    resourceType: 'pods',
    namespace,
    isCompact: true,
    showTitle: true,
    filter: apiRule => apiRule.spec.service.name === resourceName,
  };

  return (
    <ComponentForList name="apiRulesList" params={params} key="api-rules" />
  );
}
