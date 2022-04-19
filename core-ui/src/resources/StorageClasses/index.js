import React from 'react';

export const resourceType = 'StorageClasses';
export const namespaced = false;

export const List = React.lazy(() => import('./StorageClassList'));
export const Details = React.lazy(() => import('./StorageClassDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'PersistentVolume',
      clusterwide: true,
    },
    {
      kind: 'PersistentVolumeClaim',
      clusterwide: true,
    },
    {
      kind: 'Secret',
      clusterwide: true,
    },
  ],
  networkFlowLevel: 2,
  matchers: {
    Secret: (sc, secret) => sc.parameters?.secretName === secret.metadata.name,
  },
  depth: 1,
});
