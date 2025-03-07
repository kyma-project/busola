import { ClusterEventList } from 'resources/ClusterEvents/ClusterEventList.js';
import { ClusterEventDetails } from 'resources/ClusterEvents/ClusterEventDetails';

export { resourceType } from 'resources/Events';
export const namespaced = false;
export const apiGroup = '';
export const apiVersion = 'v1';

export const customPath = 'events/:namespace?/:resourceName?';
export const category = '';
export const topLevelNode = true;
export const icon = 'warning2';

export const List = ClusterEventList;
export const Details = ClusterEventDetails;
