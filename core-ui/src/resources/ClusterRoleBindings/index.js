import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ClusterRoleBindings';
export const namespaced = false;
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const List = React.lazy(() => import('./ClusterRoleBindingList'));
export const Details = React.lazy(() => import('./ClusterRoleBindingDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      resource: { kind: 'ServiceAccount' },
      filter: (crb, sa) =>
        crb.subjects?.find(
          sub =>
            sub.kind === 'ServiceAccount' &&
            sub.name === sa.metadata.name &&
            sub.namespace === sa.metadata.namespace,
        ),
    },
  ],
  depth: 1,
});
