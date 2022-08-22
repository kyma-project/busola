import React from 'react';

import { getServiceName } from './helpers';

export const resourceType = 'Subscriptions';
export const namespaced = true;

export const List = React.lazy(() => import('./SubscriptionList'));
export const Details = React.lazy(() => import('./SubscriptionDetails'));

export const resourceGraphConfig = () => ({
  depth: 1,
  networkFlowLevel: -2,
  relations: [
    {
      resource: { kind: 'Service' },
      filter: (subscription, service) =>
        getServiceName(subscription.spec.sink) === service.metadata.name,
    },
  ],
});
