import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'ConfigMaps';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

const configMapI18nDescriptionKey = 'config-maps.description';
const configMapDocsURL =
  'https://kubernetes.io/docs/concepts/configuration/configmap/';

export const List = React.lazy(() => import('./ConfigMapList'));
export const Details = React.lazy(() => import('./ConfigMapDetails'));

export const ResourceDescription = (
  <Description i18nKey={configMapI18nDescriptionKey} url={configMapDocsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  depth: 1,
  networkFlowLevel: 1,
});
