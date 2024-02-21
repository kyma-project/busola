import React from 'react';

export const resourceType = 'Namespaces';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = '';
export const icon = 'dimension';
export const topLevelNode = true;

export const namespaceI18nDescriptionKey = 'namespaces.description';
export const namespaceDocsURL =
  'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces';

export const List = React.lazy(() => import('./NamespaceList'));
export const Details = React.lazy(() => import('./NamespaceDetails'));
