import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'Functions';
export const namespaced = true;
export const apiGroup = 'serverless.kyma-project.io';
export const apiVersion = 'v1alpha1';
export const category = predefinedCategories.workloads;

export const List = React.lazy(() => import('./FunctionList'));
export const Details = React.lazy(() => import('./FunctionDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
});
