import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'CustomResourceDefinitions';
export const namespaced = false;
export const apiGroup = 'apiextensions.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;
export const aliases = ['crds'];

export const customResourceDefinitionI18nDescriptionKey =
  'custom-resource-definitions.description';
export const customResourceDefinitionDocsURL =
  'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/';

export const List = React.lazy(() => import('./CustomResourceDefinitionList'));
export const Details = React.lazy(() =>
  import('./CustomResourceDefinitionDetails'),
);
