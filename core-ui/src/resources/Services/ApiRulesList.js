import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';

import './ServiceDetails.scss';
import { useRecoilValue } from 'recoil';
import { extensionsState } from 'state/navigation/extensionsAtom';

const ExtensibilityList = React.lazy(() =>
  import('../../components/Extensibility/ExtensibilityList'),
);

export function ApiRulesList({ serviceName, namespace }) {
  const { t } = useTranslation();
  const extensions = useRecoilValue(extensionsState);

  const extensibilityAPIRules = extensions?.find(
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
          disableCreate
          title={t('api-rules')}
        />
      </Suspense>
    );

  return (
    <ResourcesList
      key="api-rule-services"
      hasDetailsView
      resourceUrl={url}
      title={t('api-rules')}
      resourceType={'apirules'}
      namespace={namespace}
      isCompact
      showTitle
      disableCreate
      filter={filterByServiceName}
    />
  );
}

export default ApiRulesList;
