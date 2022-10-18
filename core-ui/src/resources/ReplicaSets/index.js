import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ReplicaSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = PredefinedCategories.workloads;

export const List = React.lazy(() => import('./ReplicaSetList'));
export const Details = React.lazy(() => import('./ReplicaSetDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
});
