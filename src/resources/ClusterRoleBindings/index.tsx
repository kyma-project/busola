import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'ClusterRoleBindings';
export const namespaced = false;
export const apiGroup = 'rbac.authorization.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const i18nDescriptionKey = 'cluster-role-bindings.description';
export const docsURL =
  'https://kyma-project.io/docs/kyma/latest/04-operation-guides/security/sec-02-authorization-in-kyma/#role-binding';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./ClusterRoleBindingList'));
export const Details = React.lazy(() => import('./ClusterRoleBindingDetails'));
export const Create = React.lazy(() => import('./ClusterRoleBindingCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  relations: [
    {
      resource: { kind: 'ServiceAccount' },
      filter: (crb, sa) =>
        crb.subjects?.find(
          (sub: any) =>
            sub.kind === 'ServiceAccount' &&
            sub.name === sa.metadata.name &&
            sub.namespace === sa.metadata.namespace,
        ),
    },
  ],
  depth: 1,
});
