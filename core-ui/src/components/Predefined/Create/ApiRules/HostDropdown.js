import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

const hasWildcard = hostname => {
  if (!hostname) return false;

  // hostname may contain optional namespace prefix ({namespace}/{hostname})
  if (hostname.includes('/')) {
    hostname = hostname.split('/')[1];
  }
  return hostname.includes('*');
};

function getSelectedHost(host, hosts) {
  if (hosts.includes(host)) {
    // console.log('no wildcard', host);
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
  const filterUnique = (e, i, arr) => arr.indexOf(e) === i;

  const [gatewayNamespace, gatewayName] = (gatewayStr || '/').split('/');

  const choosenGateway = (gatewaysQuery.data || []).find(
    ({ metadata }) =>
      metadata.name === gatewayName && metadata.namespace === gatewayNamespace,
  );
  const hosts = (choosenGateway?.spec.servers.flatMap(s => s.hosts) || [])
    .filter(filterUnique)
    // hostname may be prefixed with namespace - get rid of it
    .map(host =>
      host.includes('/') ? host.substring(host.lastIndexOf('/') + 1) : host,
    );

  // // choose first available host when gateways load
  useEffect(() => {
    if (!gatewayStr && gatewaysQuery.data?.length) {
      const host = (gatewaysQuery.data[0]?.spec.servers.flatMap(s => s.hosts) ||
        [])[0];

      setHost(host);
    }
  }, [gatewaysQuery]);

  // choose first host when gateway changes
  useEffect(() => {
    if (choosenGateway) {
      setHost((choosenGateway.spec.servers.flatMap(s => s.hosts) || [])[0]);
    }
  }, [choosenGateway]);

  const hostOptions = hosts.map(host => ({ text: host, key: host }));

  const selectedHost = getSelectedHost(host, hosts);

  return (
    <>
      <FormField
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
      <FormField
        advanced
        required
        label={t('api-rules.form.subdomain')}
        value={subdomain}
        setValue={newSubdomain => {
          setSubdomain(newSubdomain);
          setHost(host.replace('*', newSubdomain));
        }}
        input={Inputs.Text}
        disabled={!hasWildcard(selectedHost)}
        placeholder={t('Subdomain part of Api Rule address.')}
        pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$"
      />
    </>
  );
}
