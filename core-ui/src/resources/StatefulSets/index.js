import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'StatefulSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const List = React.lazy(() => import('./StatefulSetList'));
export const Details = React.lazy(() => import('./StatefulSetDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (ss, pod) =>
        matchByOwnerReference({
          resource: pod,
          owner: ss,
        }),
    },
  ],
});
