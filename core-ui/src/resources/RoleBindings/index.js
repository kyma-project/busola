import React from 'react';

export const resourceType = 'RoleBindings';
export const namespaced = true;

export const List = React.lazy(() => import('./RoleBindingList'));
export const Details = React.lazy(() => import('./RoleBindingDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRole',
      clusterwide: true,
    },
    {
      kind: 'Role',
    },
    {
      kind: 'ServiceAccount',
    },
  ],
  matchers: {
    ServiceAccount: (rb, sa) =>
      rb.subjects?.find(
        sub =>
          sub.kind === 'ServiceAccount' &&
          sub.name === sa.metadata.name &&
          sub.namespace === sa.metadata.namespace,
      ),
  },
  depth: 1,
});
