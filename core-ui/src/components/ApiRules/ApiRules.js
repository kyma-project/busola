import React from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';

import { PageHeader } from 'react-shared';
import ApiRuleStatus from 'components/ApiRules/ApiRuleStatus/ApiRuleStatus';
import {
  GoToApiRuleDetails,
  CopiableApiRuleHost,
  ApiRuleServiceInfo,
} from 'components/ApiRules/components';

import ApiRulesListWrapper from 'components/ApiRules/ApiRulesList/ApiRulesListWrapper';

import { TOOLBAR } from './constants';

const headerRenderer = () => ['Name', 'Host', 'Service', 'Status'];
const textSearchProperties = [
  'name',
  'spec.service.host',
  'spec.service.name',
  'spec.service.port',
  'status.apiRuleStatus.code',
];
const rowRenderer = apiRule => [
  <GoToApiRuleDetails apiRule={apiRule} />,
  <CopiableApiRuleHost apiRule={apiRule} />,
  <ApiRuleServiceInfo apiRule={apiRule} />,
  <ApiRuleStatus apiRule={apiRule} />,
];

export default function ApiRules() {
  const namespace = LuigiClient.getContext().namespaceId;
  const { t } = useTranslation();

  return (
    <>
      <PageHeader
        title={t(TOOLBAR.TITLE)}
        description={t(TOOLBAR.DESCRIPTION)}
      />
      <ApiRulesListWrapper
        noTitle={true}
        namespace={namespace}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        textSearchProperties={textSearchProperties}
      />
    </>
  );
}
