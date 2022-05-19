import React from 'react';

export const resourceType = 'PersistentVolumeClaims';
export const namespaced = true;

export const List = React.lazy(() => import('./PersistentVolumeClaimList'));
export const Details = React.lazy(() =>
  import('./PersistentVolumeClaimDetails'),
);

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'Pod',
    },
    {
      kind: 'StorageClass',
    },
    {
      kind: 'PersistentVolume',
      clusterwide: true,
    },
  ],
  depth: 1,
  networkFlowLevel: 1,
  matchers: {
    StorageClass: (pvc, sc) => pvc.spec.storageClassName === sc.metadata.name,
    PersistentVolume: (pvc, pv) => pvc.spec.volumeName === pv.metadata.name,
  },
});
