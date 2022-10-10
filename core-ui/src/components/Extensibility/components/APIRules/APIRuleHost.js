import React from 'react';

import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { CopiableLink } from 'shared/components/Link/CopiableLink';

function getGatewayHost(gateway) {
  const properServer = gateway.spec.servers.filter(
    server => server.port.protocol === 'HTTPS',
  );
  if (!properServer?.length || !properServer[0].hosts?.length) return null;
  return properServer[0].hosts[0].replace('*.', '');
}

export const APIRuleHost = ({ value, schema, structure, ...props }) => {
  const { t } = useTranslation();

  let hostname = value?.host;

  // regex is explained here: https://stackoverflow.com/questions/17986371/regular-expression-to-validate-fqdn-in-c-sharp-and-javascript
  const regex = /^(?=.{1,254}$)((?=[a-z0-9-]{1,63}\.)(xn--+)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}$/i;
  const isFQDN = hostname?.match(regex);
  const [gatewayName, gatewayNamespace] = value?.gateway
    ? value?.gateway?.split('.', 2)
    : [null, null];
  const gatewayUrl = `/apis/networking.istio.io/v1beta1/namespaces/${gatewayNamespace}/gateways/${gatewayName}`;

  const { data: gateway, error, loading } = useGet(gatewayUrl, {
    skip: !(gatewayName && gatewayNamespace),
  });

  if (!value) return t('common.headers.loading');
  if (!isFQDN) {
    if (loading) return t('common.headers.loading');
    if (error) return `${t('common.tooltips.error')} ${error.message}`;
    hostname = `${hostname}.${getGatewayHost(gateway)}`;
  }

  return <CopiableLink url={`https://${hostname}`} />;
};
