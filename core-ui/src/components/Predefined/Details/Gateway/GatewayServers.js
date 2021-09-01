import React from 'react';
import { useTranslation } from 'react-i18next';
import { GenericList } from 'react-shared';

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
    server.name || '-',
    server.tls?.mode || '-',
    server.tls?.credentialName || '-',
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
