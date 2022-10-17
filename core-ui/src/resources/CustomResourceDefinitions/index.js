import React from 'react';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'CustomResourceDefinitions';
export const namespaced = false;
export const apiGroup = 'apiextensions.k8s.io';
export const apiVersion = 'v1';
export const category = PredefinedCategories.configuration;

export const List = React.lazy(() => import('./CustomResourceDefinitionList'));
export const Details = React.lazy(() =>
  import('./CustomResourceDefinitionDetails'),
);
