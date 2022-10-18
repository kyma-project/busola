import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'StorageClasses';
export const namespaced = false;

export const List = React.lazy(() => import('./StorageClassList'));
export const Details = React.lazy(() => import('./StorageClassDetails'));
export const apiGroup = 'storage.k8s.io';
export const apiVersion = 'v1';
export const category = PredefinedCategories.storage;

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
