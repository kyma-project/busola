import React from 'react';

export const resourceType = 'ReplicaSets';
export const namespaced = true;

export const List = React.lazy(() => import('./ReplicaSetsList'));
export const Details = React.lazy(() => import('./ReplicaSetsDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Deployment',
    },
    {
      kind: 'Pod',
    },
  ],
});
