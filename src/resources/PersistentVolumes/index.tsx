import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'PersistentVolumes';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.storage;

export const i18nDescriptionKey = 'pv.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/storage/persistent-volumes';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = lazyWithRetries(() => import('./PersistentVolumeList'));
export const Details = lazyWithRetries(
  () => import('./PersistentVolumeDetails'),
);
export const Create = lazyWithRetries(() => import('./PersistentVolumeCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  depth: 1,
  relations: [
    {
      resource: { kind: 'StorageClass', namespace: null },
      filter: (pv, sc) => pv.spec.storageClassName === sc.metadata.name,
    },
  ],
});
