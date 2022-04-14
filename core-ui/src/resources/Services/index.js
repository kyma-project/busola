import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';

export const resourceType = 'Services';
export const namespaced = true;

export const List = React.lazy(() => import('./ServiceList'));
export const Details = React.lazy(() => import('./ServiceDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Deployment',
    },
    {
      kind: 'APIRule',
    },
    {
      kind: 'Function',
    },
    {
      kind: 'Subscription',
    },
    {
      kind: 'Ingress',
    },
    {
      kind: 'VirtualService',
    },
  ],
  matchers: {
    Function: (service, functión) =>
      matchByOwnerReference({
        resource: service,
        owner: functión,
      }),
  },
});
