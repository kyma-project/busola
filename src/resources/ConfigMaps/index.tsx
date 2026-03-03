import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { matchByOwnerReference } from 'shared/utils/helpers';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

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

export const List = lazyWithRetries(() => import('./ConfigMapList'));
export const Details = lazyWithRetries(() => import('./ConfigMapDetails'));
export const Create = lazyWithRetries(() => import('./ConfigMapCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  depth: 1,
  networkFlowLevel: 1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (cm, pod) =>
        matchByOwnerReference({
          resource: cm,
          owner: pod,
        }),
    },
  ],
});
