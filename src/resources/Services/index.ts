import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';

import { matchByOwnerReference } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Services';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories['discovery-and-network'];

export const List = React.lazy(() => import('./ServiceList'));
export const Details = React.lazy(() => import('./ServiceDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
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
