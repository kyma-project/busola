import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';

export const resourceType = 'Services';
export const namespaced = true;

export const List = React.lazy(() => import('./ServicesList'));
export const Details = React.lazy(() => import('./ServicesDetails'));

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
  ],
  matchers: {
    Function: (service, functión) =>
      matchByOwnerReference({
        resource: service,
        owner: functión,
      }),
  },
});
