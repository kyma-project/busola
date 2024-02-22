import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'ConfigMaps';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const i18nDescriptionKey = 'config-maps.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/configuration/configmap/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./ConfigMapList'));
export const Details = React.lazy(() => import('./ConfigMapDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  depth: 1,
  networkFlowLevel: 1,
});
