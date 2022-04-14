import React from 'react';

export const resourceType = 'Gateways';
export const namespaced = true;

export const List = React.lazy(() => import('./GatewayList'));
export const Details = React.lazy(() => import('./GatewayDetails'));

function matchByTlsCredentials(gateway, secret) {
  return (gateway.spec?.servers || []).some(
    server => server?.tls?.credentialName === secret.metadata.name,
  );
}

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  relations: [
    {
      kind: 'APIRule',
      clusterwide: true,
    },
    {
      kind: 'Secret',
      clusterwide: true,
    },
    {
      kind: 'VirtualService',
      clusterwide: true,
    },
  ],
  depth: 1,
  networkFlowLevel: -3,
  matchers: {
    Secret: (gateway, secret) => matchByTlsCredentials(secret, gateway),
  },
});
