import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ReplicaSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const replicaSetI18nDescriptionKey = 'replica-sets.description';
export const replicaSetDocsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/';

export const List = React.lazy(() => import('./ReplicaSetList'));
export const Details = React.lazy(() => import('./ReplicaSetDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
});
