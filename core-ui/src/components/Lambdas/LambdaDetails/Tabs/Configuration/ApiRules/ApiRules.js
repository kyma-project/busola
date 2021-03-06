import React from 'react';

import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import {
  GoToApiRuleDetails,
  CopiableApiRuleHost,
  ApiRuleAccessStrategiesList,
} from 'components/ApiRules/ApiRulesList/components';

import ApiRulesListWrapper from 'components/ApiRules/ApiRulesList/ApiRulesListWrapper';

import { LAMBDA_PHASES } from 'components/Lambdas/constants';
import { getLambdaStatus } from 'components/Lambdas/helpers/lambdas/getLambdaStatus';
import { useTranslation } from 'react-i18next';

const textSearchProperties = [
  'metadata.name',
  'service.host',
  'status.apiRuleStatus.code',
];

const rowRenderer = apiRule => ({
  cells: [
    <GoToApiRuleDetails apiRule={apiRule} />,
    <CopiableApiRuleHost apiRule={apiRule} />,
    <ApiRuleStatus apiRule={apiRule} />,
  ],
  collapseContent: <ApiRuleAccessStrategiesList apiRule={apiRule} />,
  showCollapseControl: !!apiRule.spec.rules,
  withCollapseControl: true,
});

export default function ApiRules({ lambda, isActive }) {
  const disableExposeButton =
    getLambdaStatus(lambda.status).phase !== LAMBDA_PHASES.RUNNING.TYPE;

  const { t } = useTranslation();
  const headerRenderer = () => [
    '',
    t('common.headers.name'),
    t('api-rules.list.headers.host'),
    t('api-rules.list.headers.status'),
  ];

  return (
    <ApiRulesListWrapper
      skipRequest={!isActive}
      service={lambda}
      resourceType="Function"
      inSubView={true}
      redirectCtx="namespaces"
      redirectPath={`functions/details/${lambda.metadata.name}`}
      portForCreate="80"
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      textSearchProperties={textSearchProperties}
      disableExposeButton={disableExposeButton}
    />
  );
}

export function ServiceApiRules({ service }) {
  const { t } = useTranslation();
  const headerRenderer = () => [
    '',
    t('common.headers.name'),
    t('api-rules.list.headers.host'),
    t('api-rules.list.headers.status'),
  ];

  return (
    <ApiRulesListWrapper
      service={service}
      resourceType="Service"
      inSubView={true}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      textSearchProperties={textSearchProperties}
    />
  );
}
