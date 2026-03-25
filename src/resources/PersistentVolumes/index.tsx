import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export type PersistentVolumeSpecType = {
  storageClassName?: string;
  mountOptions: string[];
  accessModes?: string[];
  persistentVolumeReclaimPolicy?: string;
  volumeMode?: string;
  local?: {
    path?: string;
  };
  nfs?: {
    path?: string;
    server?: string;
  };
  csi?: {
    driver?: string;
    volumeHandle?: string;
  };
  iscsi?: {
    targetPortal?: string;
    iqn?: string;
    lun?: string;
    secretRef: {
      name: string;
    };
  };
  capacity?: {
    storage?: string;
  };
  claimRef?: {
    name?: string;
    namespace?: string;
  };
  fc: {
    targetWWNs?: string[];
    lun?: string;
  };
  hostPath?: {
    path?: string;
  };
};

export type PersistentVolumeMetadataType = {
  name: string;
  namespace?: string;
  labels?: Record<string, string>;
  finalizers?: string[];
};

export type PersistentVolumeType = {
  spec: PersistentVolumeSpecType;
  metadata: PersistentVolumeMetadataType;
  [key: string]: any;
};

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
