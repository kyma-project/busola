import React from 'react';

export const resourceType = 'ReplicaSets';
export const namespaced = true;

export const List = React.lazy(() => import('./ReplicaSetList'));
export const Details = React.lazy(() => import('./ReplicaSetDetails'));

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
