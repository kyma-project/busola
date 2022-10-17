import React from 'react';

export const resourceType = 'ClusterRoles';
export const namespaced = false;
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';

export const List = React.lazy(() => import('./ClusterRoleList'));
export const Details = React.lazy(() => import('./ClusterRoleDetails'));

export const resourceGraphConfig = (t, context) => ({
  depth: 2,
  relations: [
    {
      resource: { kind: 'ClusterRoleBinding' },
      filter: (cr, crb) =>
        crb.roleRef.kind === 'ClusterRole' &&
        crb.roleRef.name === cr.metadata.name,
    },
    {
      resource: { kind: 'RoleBinding', namespace: null },
      filter: (cr, rb) =>
        rb.roleRef.kind === 'ClusterRole' &&
        rb.roleRef.name === cr.metadata.name,
    },
  ],
});
