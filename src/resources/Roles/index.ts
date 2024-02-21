import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Roles';
export const namespaced = true;

export const List = React.lazy(() => import('./RoleList'));
export const Details = React.lazy(() => import('./RoleDetails'));
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const roleI18DescriptionKey = 'roles.description';
export const roleDocsURL =
  'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization';

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  relations: [
    {
      resource: { kind: 'RoleBinding' },
      filter: (cr, rb) =>
        rb.roleRef.kind === 'Role' && rb.roleRef.name === cr.metadata.name,
    },
  ],
  depth: 2,
});
