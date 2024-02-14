import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'CustomResourceDefinitions';
export const namespaced = false;
export const apiGroup = 'apiextensions.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;
export const aliases = ['crds'];

export const List = React.lazy(() => import('./CustomResourceDefinitionList'));
export const Details = React.lazy(() =>
  import('./CustomResourceDefinitionDetails'),
);
export const Create = React.lazy(() =>
  import('./CustomResourceDefinitionCreate'),
);
