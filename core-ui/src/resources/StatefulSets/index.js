import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';

export const resourceType = 'StatefulSets';
export const namespaced = true;

export const List = React.lazy(() => import('./StatefulSetList'));
export const Details = React.lazy(() => import('./StatefulSetDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Pod',
    },
  ],
  matchers: {
    Pod: (ss, pod) =>
      matchByOwnerReference({
        resource: pod,
        owner: ss,
      }),
  },
});
