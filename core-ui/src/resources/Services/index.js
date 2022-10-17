import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'Services';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = PredefinedCategories['discovery-and-network'];

export const List = React.lazy(() => import('./ServiceList'));
export const Details = React.lazy(() => import('./ServiceDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Function' },
      filter: (service, functión) =>
        matchByOwnerReference({
          resource: service,
          owner: functión,
        }),
    },
  ],
});
