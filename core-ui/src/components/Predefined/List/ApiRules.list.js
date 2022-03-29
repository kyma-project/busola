import React from 'react';
import {
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import { useTranslation, Trans } from 'react-i18next';
import { Link, ResourcesList } from 'react-shared';
import { APIRulesCreate } from '../Create/ApiRules/ApiRules.create';

const ApiRulesList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('api-rules.list.headers.host'),
      value: apiRule => <CopiableApiRuleHost apiRule={apiRule} />,
    },
    {
      header: t('api-rules.list.headers.service-name'),
      value: apiRule => <ApiRuleServiceInfo apiRule={apiRule} />,
    },
    {
      header: t('api-rules.list.headers.status'),
      value: apiRule => <ApiRuleStatus apiRule={apiRule} />,
    },
  ];

  const description = (
    <Trans i18nKey="api-rules.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/05-technical-reference/00-custom-resources/apix-01-apirule/#documentation-content"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      resourceName={t('api-rules.title')}
      description={description}
      createResourceForm={APIRulesCreate}
      {...props}
    />
  );
};

export default ApiRulesList;
