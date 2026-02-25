import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

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

export const List = lazyWithRetries(() => import('./NamespaceList'));
export const Details = lazyWithRetries(() => import('./NamespaceDetails'));
export const Create = lazyWithRetries(() => import('./NamespaceCreate'));
