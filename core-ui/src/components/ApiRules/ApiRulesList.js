import React from 'react';
import { ComponentForList } from 'shared/getComponents';

export function ApiRulesList({ serviceName, namespace }) {
  const params = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${namespace}/apirules`,
    resourceType: 'apirules',
    namespace,
    isCompact: true,
    showTitle: true,
    createFormProps: { serviceName },
    filter: apiRule => apiRule.spec.service.name === serviceName,
  };

  return (
    <ComponentForList
      name="apiRulesList"
      params={params}
      key="apirules"
      nameForCreate="ApiRulesCreate"
    />
  );
}
