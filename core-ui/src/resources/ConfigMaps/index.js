import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ConfigMaps';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const List = React.lazy(() => import('./ConfigMapList'));
export const Details = React.lazy(() => import('./ConfigMapDetails'));

export const resourceGraphConfig = (t, context) => ({
  depth: 1,
  networkFlowLevel: 1,
});
