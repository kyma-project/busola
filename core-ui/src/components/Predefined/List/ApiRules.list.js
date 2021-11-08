import React from 'react';
import { Button } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';
import { PANEL } from '../../ApiRules/constants';
import {
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/ApiRulesList/components';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-shared';
import { Trans } from 'react-i18next';

export const ApiRulesList = ({ DefaultRenderer, ...otherParams }) => {
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
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('api-rules.title')}
      description={description}
      {...otherParams}
    />
  );
};
