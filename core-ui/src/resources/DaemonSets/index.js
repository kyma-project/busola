import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';

export const resourceType = 'DaemonSets';
export const namespaced = true;

export const List = React.lazy(() => import('./DaemonSetList'));
export const Details = React.lazy(() => import('./DaemonSetDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Pod',
    },
  ],
  matchers: {
    Pod: (ds, pod) =>
      matchByOwnerReference({
        resource: pod,
        owner: ds,
      }),
  },
});
