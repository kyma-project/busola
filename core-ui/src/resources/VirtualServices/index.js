import React from 'react';

export const resourceType = 'VirtualServices';
export const namespaced = true;

export const List = React.lazy(() => import('./VirtualServiceList'));
export const Details = React.lazy(() => import('./VirtualServiceDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      kind: 'APIRule',
    },
    {
      kind: 'Gateway',
      clusterwide: true,
    },
    {
      kind: 'Service',
    },
  ],
  matchers: {
    Gateway: (vs, gateway) =>
      vs.spec.gateways.some(g => {
        const [name, namespace] = g.split('.');
        return (
          name === gateway.metadata.name &&
          namespace === gateway.metadata.namespace
        );
      }),
    Service: (vs, service) =>
      vs.spec.http.some(h =>
        h.route.some(r => {
          const [name, namespace] = r.destination?.host.split('.');
          return (
            name === service.metadata.name &&
            namespace === service.metadata.namespace
          );
        }),
      ),
  },
});
