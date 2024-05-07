import { configFeaturesNames, NavNode } from 'state/types';

export const kymaModulesNavNode: NavNode = {
  category: 'Configuration',
  resourceType: 'kyma',
  pathSegment: 'kymamodules',
  label: 'Modules',
  namespaced: false,
  requiredFeatures: [configFeaturesNames.EXTENSIBILITY],
  apiGroup: '',
  apiVersion: 'v1',
};
