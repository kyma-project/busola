import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ConfigMaps';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = PredefinedCategories.configuration;

export const List = React.lazy(() => import('./ConfigMapList'));
export const Details = React.lazy(() => import('./ConfigMapDetails'));

export const resourceGraphConfig = (t, context) => ({
  depth: 1,
  networkFlowLevel: 1,
});
