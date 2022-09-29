import React from 'react';

export const resourceType = 'StorageClasses';
export const namespaced = false;

export const List = React.lazy(() => import('./StorageClassList'));
export const Details = React.lazy(() => import('./StorageClassDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowLevel: 2,
  relations: [
    {
      resource: { kind: 'Secret', namespace: null },
      filter: (sc, secret) =>
        sc.parameters?.secretName === secret.metadata.name,
    },
  ],
  depth: 1,
});
