import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'RoleBindings';
export const namespaced = true;
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const List = React.lazy(() => import('./RoleBindingList'));
export const Details = React.lazy(() => import('./RoleBindingDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  relations: [
    {
      resource: { kind: 'ServiceAccount' },
      filter: (rb, sa) =>
        rb.subjects?.find(
          (sub: any) =>
            sub.kind === 'ServiceAccount' && sub.name === sa.metadata.name,
        ),
    },
  ],
  depth: 1,
});
