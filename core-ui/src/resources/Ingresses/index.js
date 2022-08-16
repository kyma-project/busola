import React from 'react';

export const resourceType = 'Ingresses';
export const namespaced = true;

export const List = React.lazy(() => import('./IngressList'));
export const Details = React.lazy(() => import('./IngressDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowLevel: 0,
  networkFlowKind: true,
  relations: [
    {
      resource: { kind: 'Service' },
      filter: (ingress, service) =>
        (ingress.spec.rules || []).some(rule =>
          (rule.http?.paths || []).some(
            path => path.backend?.service?.name === service.metadata.name,
          ),
        ) ||
        ingress.spec?.defaultBackend?.resource?.name === service.metadata.name,
    },
  ],
});
