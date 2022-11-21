import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
// import { ApiRulesList } from 'components/ApiRules/ApiRulesList';

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
  const filterByServiceName = ({ spec, ...props }) => {
    const mainService = spec.service?.name === serviceName;
    const ruleService = spec.rules?.find(
      ref => ref.service?.name === serviceName,
    );
    return mainService || ruleService;
  };

  console.log('extensibilityAPIRules', extensibilityAPIRules);

  if (extensibilityAPIRules) {
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
          navigateFn={entry => {
            try {
              const {
                kind,
                metadata: { name, namespace },
              } = entry;

              const namespacePart = namespace ? `namespaces/${namespace}/` : '';
              const resourceTypePart =
                extensibilityAPIRules.general.urlPath ||
                pluralize(kind.toLowerCase());

              LuigiClient.linkManager()
                .fromContext('cluster')
                .navigate(
                  namespacePart + resourceTypePart + '/details/' + name,
                );
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </Suspense>
    );
  } else {
    return (
      <ResourcesList
        key="api-rule-services"
        {...{
          hasDetailsView: true,
          fixedPath: true,
          resourceUrl: url,
          resourceType: 'apirules',
          namespace,
          isCompact: true,
          showTitle: true,
          filter: filterByServiceName,
        }}
      />
    );
  }
}

export default ApiRulesList;
