import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export { resourceType, ResourceDescription } from 'resources/Events';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = '';
export const icon = 'warning2';
export const topLevelNode = true;

export const pathSegment = 'clusterevents';
export const customPath = `${pathSegment}/:namespace?/:resourceName?`;

export const List = lazyWithRetries(() => import('./ClusterEventList'));
export const Details = lazyWithRetries(() => import('./ClusterEventDetails'));
