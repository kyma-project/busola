import { lazy } from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';

export const resourceType = 'PersistentVolumeClaims';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.storage;

export const List = lazy(() => import('./PersistentVolumeClaimList'));
export const Details = lazy(() => import('./PersistentVolumeClaimDetails'));
export const Create = lazy(() => import('./PersistentVolumeClaimCreate'));

export const i18nDescriptionKey = 'persistent-volume-claims.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/storage/persistent-volumes/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  depth: 1,
  networkFlowLevel: 1,
  relations: [
    {
      resource: { kind: 'StorageClass', namespace: null },
      filter: (pvc, sc) => pvc.spec.storageClassName === sc.metadata.name,
    },
    {
      resource: { kind: 'PersistentVolume', namespace: null },
      filter: (pvc, pv) => pvc.spec.volumeName === pv.metadata.name,
    },
  ],
});
