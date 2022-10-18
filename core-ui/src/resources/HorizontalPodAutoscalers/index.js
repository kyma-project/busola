import React from 'react';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'HorizontalPodAutoscalers';
export const namespaced = true;
export const apiGroup = 'autoscaling';
export const apiVersion = 'v2beta2';
export const category = PredefinedCategories['discovery-and-network'];

export const List = React.lazy(() => import('./HorizontalPodAutoscalerList'));
export const Details = React.lazy(() =>
  import('./HorizontalPodAutoscalerDetails'),
);

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
});
