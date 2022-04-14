import React from 'react';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { Link } from 'fundamental-react';
import LuigiClient from '@luigi-project/client';

function ServerPort({ port }) {
  const number = port.targetPort
    ? `${port.number}:${port.targetPort}`
    : port.number;
  return `${port.name} (${number})`;
}

function ServerHosts({ hosts }) {
  return (
    <ul>
      {hosts.map(host => (
        <li key={host}>{host}</li>
      ))}
    </ul>
  );
}

export function GatewayServers(gateway) {
  const { t } = useTranslation();

  const headerRenderer = () => [
    t('gateways.servers.port'),
    t('gateways.servers.hosts'),
    t('gateways.servers.name'),
    t('gateways.servers.tls'),
    t('gateways.servers.secret'),
  ];

  const rowRenderer = server => [
    <ServerPort port={server.port} />,
    <ServerHosts hosts={server.hosts} />,
    server.port.name || EMPTY_TEXT_PLACEHOLDER,
    server.tls?.mode || EMPTY_TEXT_PLACEHOLDER,
    server.tls?.credentialName ? (
      <Link
        onClick={() =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(
              `namespaces/istio-system/secrets/details/${server.tls.credentialName}`,
            )
        }
      >
        {server.tls.credentialName}
      </Link>
    ) : (
      EMPTY_TEXT_PLACEHOLDER
    ),
  ];

  return (
    <GenericList
      key="conditions"
      title={t('gateways.servers.title')}
      showSearchField={false}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      entries={gateway.spec.servers || []}
    />
  );
}
