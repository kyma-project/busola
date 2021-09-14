import React from 'react';
import LuigiClient from '@luigi-project/client';

import { Link } from 'fundamental-react';
import { CopiableLink } from 'react-shared';
import { useTranslation } from 'react-i18next';

import AccessStrategies from 'components/ApiRules/AccessStrategies/AccessStrategies';

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
  let hostname = apiRule.spec.service.host;
  const regex = /^(?=.{1,254}$)((?=[a-z0-9-]{1,63}\.)(xn--+)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/i;
  const isFQDN = hostname.match(regex);
  console.log('isFQDN', isFQDN);
  const [gatewayName, gatewayNamespace] = apiRule.spec.gateway.split('.', 2);

  console.log('gatewayName', gatewayName, 'gatewayNamespace', gatewayNamespace);
  //get gateway
  if (!isFQDN) {
    // hostname = `${hostname}.${apiRule.spec.gateway}`
  }
  console.log('hostname', hostname);
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
