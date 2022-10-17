import React from 'react';
import { ConfigFeaturesNames } from 'state/types';

export const resourceType = 'Gateways';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];

export const List = React.lazy(() => import('./GatewayList'));
export const Details = React.lazy(() => import('./GatewayDetails'));

function matchByTlsCredentials(gateway, secret) {
  return (gateway.spec?.servers || []).some(
    server => server?.tls?.credentialName === secret.metadata.name,
  );
}

export const resourceGraphConfig = (t, context) => ({
  depth: 1,
  networkFlowKind: true,
  networkFlowLevel: -3,
  relations: [
    {
      resource: { kind: 'Secret', namespace: null },
      filter: (gateway, secret) => matchByTlsCredentials(secret, gateway),
    },
  ],
});
