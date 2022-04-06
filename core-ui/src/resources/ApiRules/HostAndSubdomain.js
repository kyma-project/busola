import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { findGateway, getGatewayHosts, hasWildcard } from './helpers';

function getSelectedHost(host, hosts) {
  if (!host) return '';

  if (hosts.includes(host)) {
    // match no wildcard host
    return host;
  } else {
    // original host has a wildcard
    const hostMatch = hosts
      .filter(hasWildcard)
      .map(h => h.replace('*', ''))
      .find(h => host.endsWith(h));
    return hostMatch ? '*' + hostMatch : '';
  }
}

export function HostAndSubdomain({
  gatewayStr,
  gatewaysQuery,
  value: host,
  setValue: setHost,
  subdomain,
  setSubdomain,
}) {
  const { t } = useTranslation();

  const choosenGateway = findGateway(gatewayStr, gatewaysQuery.data);
  const hosts = getGatewayHosts(choosenGateway);
  const selectedHost = getSelectedHost(host, hosts);

  const hostOptions = hosts.map(host => ({ text: host, key: host }));

  // change subdomain if YAML host changes
  useEffect(() => {
    if (hasWildcard(selectedHost)) {
      const hostSuffix = selectedHost.replace('*', '');
      const possiblyNewSubdomain = host.replace(hostSuffix, '');
      setSubdomain(possiblyNewSubdomain);
    }
  }, [selectedHost]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ResourceForm.FormField
        advanced
        required
        label={t('api-rules.form.host')}
        selectedKey={selectedHost}
        setValue={newHost => {
          if (hasWildcard(newHost)) {
            setHost(newHost.replace('*', subdomain));
          } else {
            setHost(newHost);
          }
        }}
        input={Inputs.Dropdown}
        options={hostOptions}
        loading={gatewaysQuery.loading}
        error={gatewaysQuery.error}
      />
      <ResourceForm.FormField
        advanced
        required
        label={t('api-rules.form.subdomain')}
        value={subdomain}
        setValue={newSubdomain => {
          setSubdomain(newSubdomain);
          setHost(selectedHost.replace('*', newSubdomain));
        }}
        input={Inputs.Text}
        disabled={!hasWildcard(selectedHost)}
        placeholder={t('api-rules.placeholders.subdomain')}
        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$"
      />
    </>
  );
}
