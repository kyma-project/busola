import { NavNode, Scope } from '../../types';

export const createClusterNode = (scope: Scope): NavNode => ({
  category: '',
  icon: 'product',
  resourceType: 'overview',
  pathSegment: 'overview',
  label: scope === 'namespace' ? 'Back To Cluster Details' : 'Cluster Details',
  namespaced: true,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: '',
  topLevelNode: true,
});
