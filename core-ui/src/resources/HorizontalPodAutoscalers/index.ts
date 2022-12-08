import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'HorizontalPodAutoscalers';
export const namespaced = true;
export const apiGroup = 'autoscaling';
export const apiVersion = 'v2beta2';
export const category = predefinedCategories['discovery-and-network'];

export const List = React.lazy(() => import('./HorizontalPodAutoscalerList'));
export const Details = React.lazy(() =>
  import('./HorizontalPodAutoscalerDetails'),
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
});
