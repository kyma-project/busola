import React from 'react';

export const resourceType = 'PersistentVolumes';
export const namespaced = false;

export const List = React.lazy(() => import('./PersistentVolumeList'));
export const Details = React.lazy(() => import('./PersistentVolumeDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'StorageClass',
    },
    {
      kind: 'PersistentVolumeClaim',
      clusterwide: true,
    },
  ],
  depth: 1,
  matchers: {
    StorageClass: (pv, sc) => pv.spec.storageClassName === sc.metadata.name,
  },
});
