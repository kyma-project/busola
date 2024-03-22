import React from 'react';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'Namespaces';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = '';
export const icon = 'dimension';
export const topLevelNode = true;

export const i18nDescriptionKey = 'namespaces.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./NamespaceList'));
export const Details = React.lazy(() => import('./NamespaceDetails'));
export const Create = React.lazy(() => import('./NamespaceCreate'));
