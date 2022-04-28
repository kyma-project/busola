import React from 'react';
import ApiRulesListComponent from 'resources/APIRules/APIRuleList';
import { useTranslation } from 'react-i18next';

export function ApiRulesList({ serviceName, namespace, prefix }) {
  const { i18n } = useTranslation();
  const params = {
    hasDetailsView: true,
    fixedPath: true,
    resourceUrl: `/apis/gateway.kyma-project.io/v1alpha1/namespaces/${namespace}/apirules`,
    apiPath: '/apis/gateway.kyma-project.io/v1alpha1',
    resourceType: 'apirules',
    namespace,
    isCompact: true,
    showTitle: true,
    createFormProps: { serviceName, prefix },
    filter: apiRule => apiRule.spec.service.name === serviceName,
    i18n,
  };

  return <ApiRulesListComponent {...params} />;
}
