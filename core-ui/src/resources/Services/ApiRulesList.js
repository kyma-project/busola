import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import './ServiceDetails.scss';

const ExtensibilityList = React.lazy(() =>
  import('../../components/Extensibility/ExtensibilityList'),
);
export function ApiRulesList({ serviceName, namespace }) {
  const { t } = useTranslation();
  const { customResources } = useMicrofrontendContext();

  const extensibilityAPIRules = customResources.find(
    cR => cR.general?.resource?.kind === 'APIRule',
  );

  const url = `/apis/gateway.kyma-project.io/v1beta1/namespaces/${namespace}/apirules`;
  const filterByServiceName = ({ spec }) => {
    const mainService = spec.service?.name === serviceName;
    const ruleService = spec.rules?.find(
      ref => ref.service?.name === serviceName,
    );
    return mainService || ruleService;
  };

  const navigateToApiRule = entry => {
    const {
      kind,
      metadata: { name, namespace },
    } = entry;

    const namespacePart = namespace ? `namespaces/${namespace}/` : '';
    const resourceTypePart =
      extensibilityAPIRules.general.urlPath || pluralize(kind.toLowerCase());

    LuigiClient.linkManager()
      .fromContext('cluster')
      .navigate(namespacePart + resourceTypePart + '/details/' + name);
  };

  if (extensibilityAPIRules)
    return (
      <Suspense fallback={<Spinner />}>
        <ExtensibilityList
          filterFunction={filterByServiceName}
          overrideResMetadata={extensibilityAPIRules}
          isCompact
          resourceUrl={url}
          hasDetailsView
          showTitle
          title={t('api-rules')}
          navigateFn={navigateToApiRule}
        />
      </Suspense>
    );

  return (
    <ResourcesList
      key="api-rule-services"
      hasDetailsView
      fixedPath
      resourceUrl={url}
      title={t('api-rules')}
      resourceType={'apirules'}
      namespace={namespace}
      isCompact
      showTitle
      filter={filterByServiceName}
    />
  );
}

export default ApiRulesList;
