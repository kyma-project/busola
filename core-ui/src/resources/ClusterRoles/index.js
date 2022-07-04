import React from 'react';

export const resourceType = 'ClusterRoles';
export const namespaced = false;

export const List = React.lazy(() => import('./ClusterRoleList'));
export const Details = React.lazy(() => import('./ClusterRoleDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRoleBinding',
    },
    {
      kind: 'RoleBinding',
    },
  ],
  depth: 2,
  matchers: {
    ClusterRoleBinding: (cr, crb) =>
      crb.roleRef.kind === 'ClusterRole' &&
      crb.roleRef.name === cr.metadata.name,
    RoleBinding: (cr, rb) =>
      rb.roleRef.kind === 'ClusterRole' && rb.roleRef.name === cr.metadata.name,
  },
});
