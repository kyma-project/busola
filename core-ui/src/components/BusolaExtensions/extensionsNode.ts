import { NavNode } from 'state/types';

export const extensionsNavNode: NavNode = {
  category: 'Configuration',
  resourceType: 'configmaps',
  pathSegment: 'configmaps',
  label: 'Extensions',
  namespaced: false,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: 'v1',
};
