import React from 'react';
import LuigiClient from '@luigi-project/client';

import { Link } from 'fundamental-react';
import { CopiableLink } from 'react-shared';
import { useTranslation } from 'react-i18next';

import AccessStrategies from 'components/ApiRules/AccessStrategies/AccessStrategies';
import { getApiRuleUrl } from 'components/ApiRules/helpers';

function goToApiRuleDetails(apiRule) {
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`apirules/details/${apiRule.metadata.name}`);
}

function navigateToService(apiRule) {
  LuigiClient.linkManager()
    .fromContext('namespace')
    .navigate(`services/details/${apiRule.spec.service.name}`);
}

export function GoToApiRuleDetails({ apiRule }) {
  return (
    <Link className="fd-link" onClick={() => goToApiRuleDetails(apiRule)}>
      {apiRule.metadata.name}
    </Link>
  );
}

export function CopiableApiRuleHost({ apiRule }) {
  const { i18n } = useTranslation();
  return (
    <CopiableLink url={`https://${apiRule.spec.service.host}`} i18n={i18n} />
  );
}

export function ApiRuleServiceInfo({ apiRule, withName = true }) {
  if (withName) {
    return (
      <Link
        className="link no-border"
        onClick={() => navigateToService(apiRule)}
      >
        {`${apiRule.spec.service.name} (port: ${apiRule.spec.service.port})`}
      </Link>
    );
  }

  return <span>{apiRule.spec.service.port}</span>;
}

export function ApiRuleAccessStrategiesList({ apiRule, colSpan = '5' }) {
  return (
    <td colSpan={colSpan} className="api-rules-access-strategies">
      <AccessStrategies
        strategies={apiRule?.spec?.rules || []}
        showSearchField={false}
        compact={true}
      />
    </td>
  );
}
