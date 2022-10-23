import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'DaemonSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const List = React.lazy(() => import('./DaemonSetList'));
export const Details = React.lazy(() => import('./DaemonSetDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (ds, pod) =>
        matchByOwnerReference({
          resource: pod,
          owner: ds,
        }),
    },
  ],
});
