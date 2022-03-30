import React from 'react';
import LuigiClient from '@luigi-project/client';

import { Link } from 'fundamental-react';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { CopiableLink } from 'shared/components/Link/CopiableLink';

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

function getGatewayHost(gateway) {
  const properServer = gateway.spec.servers.filter(
    server => server.port.protocol === 'HTTPS',
  );
  if (!properServer?.length || !properServer[0].hosts?.length) return null;
  return properServer[0].hosts[0].replace('*.', '');
}

export function GoToApiRuleDetails({ apiRule }) {
  return (
    <Link className="fd-link" onClick={() => goToApiRuleDetails(apiRule)}>
      {apiRule.metadata.name}
    </Link>
  );
}

export function CopiableApiRuleHost({ apiRule }) {
  const { t, i18n } = useTranslation();
  let hostname = apiRule.spec.service.host;
  // regex is explained here: https://stackoverflow.com/questions/17986371/regular-expression-to-validate-fqdn-in-c-sharp-and-javascript
  const regex = /^(?=.{1,254}$)((?=[a-z0-9-]{1,63}\.)(xn--+)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/i;
  const isFQDN = hostname.match(regex);
  const [gatewayName, gatewayNamespace] = apiRule.spec.gateway.split('.', 2);
  const gatewayUrl = `/apis/networking.istio.io/v1alpha3/namespaces/${gatewayNamespace}/gateways/${gatewayName}`;

  const { data: gateway, error, loading } = useGet(gatewayUrl, {});

  if (!isFQDN) {
    if (loading) return t('common.headers.loading');
    if (error) return `${t('common.tooltips.error')} ${error.message}`;
    hostname = `${hostname}.${getGatewayHost(gateway)}`;
  }

  return <CopiableLink url={`https://${hostname}`} i18n={i18n} />;
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
