import React from 'react';

export const resourceType = 'HorizontalPodAutoscalers';
export const namespaced = true;

export const List = React.lazy(() => import('./HorizontalPodAutoscalersList'));
export const Details = React.lazy(() =>
  import('./HorizontalPodAutoscalersDetails'),
);

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Deployment',
    },
  ],
});
