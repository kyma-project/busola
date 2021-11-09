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

// const resolveFinalHost = (subdomain, hostname) => {
//   // replace possible wildcard with lowest level domain
//   const resolvedHost = hasWildcard(hostname)
//     ? hostname.replace('*', subdomain)
//     : hostname;

//   // hostname may be prefixed with namespace - get rid of it
//   return resolvedHost.includes('/')
//     ? resolvedHost.substring(resolvedHost.lastIndexOf('/') + 1)
//     : resolvedHost;
// };

function getSelectedHost(host, gateway) {
  const hosts = gateway?.spec.servers.flatMap(s => s.hosts) || [];
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

  const gateway = (gatewaysQuery.data || []).find(
    ({ metadata }) =>
      metadata.name === gatewayName && metadata.namespace === gatewayNamespace,
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
    if (gateway) {
      setHost((gateway.spec.servers.flatMap(s => s.hosts) || [])[0]);
    }
  }, [gateway]);

  const hostOptions = (gateway?.spec.servers.flatMap(s => s.hosts) || [])
    .filter(filterUnique)
    .map(host => ({ text: host, key: host }));

  const selectedHost = getSelectedHost(host, gateway);

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
      />
    </>
  );
}
