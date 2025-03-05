import { configFeaturesNames, NavNode } from 'state/types';

export const extensionsNavNode: NavNode = {
  category: 'Configuration',
  resourceType: 'configmaps',
  resourceTypeCased: 'ConfigMap',
  pathSegment: 'busolaextensions',
  label: 'Extensions',
  namespaced: false,
  requiredFeatures: [configFeaturesNames.EXTENSIBILITY],
  apiGroup: '',
  apiVersion: 'v1',
};
