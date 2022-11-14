import React from 'react';
import ApiRulesListComponent from 'resources/APIRules/APIRuleList';

export function ApiRulesList({ serviceName, namespace, prefix }) {
  const params = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${namespace}/apirules`,
    resourceType: 'apirules',
    namespace,
    isCompact: true,
    showTitle: true,
    createFormProps: { serviceName, prefix },
    filter: apiRule => apiRule?.spec?.service?.name === serviceName,
  };

  return <ApiRulesListComponent {...params} />;
}
