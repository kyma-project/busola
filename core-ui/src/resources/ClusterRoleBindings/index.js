import React from 'react';

export const resourceType = 'ClusterRoleBindings';
export const namespaced = false;

export const List = React.lazy(() => import('./ClusterRoleBindingList'));
export const Details = React.lazy(() => import('./ClusterRoleBindingDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRole',
    },
    {
      kind: 'ServiceAccount',
    },
  ],
  matchers: {
    ServiceAccount: (crb, sa) =>
      crb.subjects?.find(
        sub =>
          sub.kind === 'ServiceAccount' &&
          sub.name === sa.metadata.name &&
          sub.namespace === sa.metadata.namespace,
      ),
  },
  depth: 1,
});
