import { NavNode, Scope } from '../../state/types';

export const createCustomResourcesNavNode = (scope: Scope): NavNode => ({
  category: 'Configuration',
  resourceType: 'customresources',
  pathSegment: 'customresources',
  label: 'Custom Resources',
  namespaced: scope === 'namespace',
  requiredFeatures: [],
  apiGroup: 'apiextensions.k8s.io',
  apiVersion: 'v1',
});
