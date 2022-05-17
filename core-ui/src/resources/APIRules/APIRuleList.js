import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

import {
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { ExternalLink } from 'shared/components/Link/ExternalLink';

import { APIRuleCreate } from './APIRuleCreate';

export function APIRuleList(props) {
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
      <ExternalLink
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
      createResourceForm={APIRuleCreate}
      {...props}
    />
  );
}

export default APIRuleList;
