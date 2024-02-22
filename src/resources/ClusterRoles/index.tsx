import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'ClusterRoles';
export const namespaced = false;
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const List = React.lazy(() => import('./ClusterRoleList'));
export const Details = React.lazy(() => import('./ClusterRoleDetails'));

export const i18nDescriptionKey = 'cluster-roles.description';
export const docsURL =
  'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#user-authorization';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
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
