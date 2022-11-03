import { NavNode, Scope } from 'state/types';

export const createClusterNode = (scope: Scope): NavNode => ({
  category: '',
  icon: scope === 'namespace' ? 'slim-arrow-left' : 'database',
  resourceType: 'overview',
  pathSegment: 'overview',
  label: scope === 'namespace' ? 'Back To Cluster Details' : 'Cluster Details',
  namespaced: scope === 'namespace',
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: '',
  topLevelNode: true,
  createUrlFn: scope === 'namespace' ? () => '/overview' : undefined,
});
