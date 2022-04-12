import React from 'react';

export const resourceType = 'ConfigMaps';
export const namespaced = true;

export const List = React.lazy(() => import('./ConfigMapList'));
export const Details = React.lazy(() => import('./ConfigMapDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'Pod',
    },
  ],
  depth: 1,
  networkFlowLevel: 1,
});
