import React from 'react';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'Events';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = '';
export const icon = 'warning2';
export const topLevelNode = true;

export const i18nDescriptionKey = 'events.description';
export const docsURL =
  'https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/';

export const showYamlTab = true;

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./EventList'));
export const Details = React.lazy(() => import('./EventDetails'));
export const Create = React.lazy(() => import('./EventYaml'));
