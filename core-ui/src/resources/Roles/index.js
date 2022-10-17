import React from 'react';

export const resourceType = 'Roles';
export const namespaced = true;

export const List = React.lazy(() => import('./RoleList'));
export const Details = React.lazy(() => import('./RoleDetails'));
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      resource: { kind: 'RoleBinding' },
      filter: (cr, rb) =>
        rb.roleRef.kind === 'Role' && rb.roleRef.name === cr.metadata.name,
    },
  ],
  depth: 2,
});
