import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'CustomResourceDefinitions';
export const namespaced = false;
export const apiGroup = 'apiextensions.k8s.io';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;
export const aliases = ['crds'];

export const i18nDescriptionKey = 'custom-resource-definitions.description';
export const docsURL =
  'https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./CustomResourceDefinitionList'));
export const Details = React.lazy(() =>
  import('./CustomResourceDefinitionDetails'),
);
