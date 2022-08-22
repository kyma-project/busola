import React from 'react';

export const resourceType = 'PersistentVolumeClaims';
export const namespaced = true;

export const List = React.lazy(() => import('./PersistentVolumeClaimList'));
export const Details = React.lazy(() =>
  import('./PersistentVolumeClaimDetails'),
);

export const resourceGraphConfig = (t, context) => ({
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
