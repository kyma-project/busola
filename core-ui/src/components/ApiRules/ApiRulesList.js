import React from 'react';
import ApiRulesListComponent from 'components/Predefined/List/ApiRules.list';
import { useTranslation } from 'react-i18next';

export function ApiRulesList({ serviceName, namespace }) {
  const { i18n } = useTranslation();
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
    i18n,
  };

  return <ApiRulesListComponent {...params} />;
}
