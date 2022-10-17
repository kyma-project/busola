export enum PredefinedCategories {
  'workloads' = 'workloads',
  'discovery-and-network' = 'discovery-and-network',
  'istio' = 'istio',
  'service-management' = 'service-management',
  'storage' = 'storage',
  'apps' = 'apps',
  'configuration' = 'configuration',
  'integration' = 'integration',
  'temporary' = 'temporary',
}

export const CATEGORIES = {
  workloads: {
    icon: 'source-code',
    label: 'workloads.title',
  },
  'discovery-and-network': {
    icon: 'instance',
    label: 'discovery-and-network.title',
  },
  istio: {
    icon: 'overview-chart',
    label: 'overview-chart',
  },
  'service-management': {
    icon: 'add-coursebook',
    label: 'service-management.title',
  },
  storage: {
    icon: 'sap-box',
    label: 'storage.title',
  },
  apps: {
    icon: 'example',
    label: 'apps.title',
  },
  configuration: {
    icon: 'settings',
    label: 'configuration.title',
  },
  integration: {
    icon: 'overview-chart',
    label: 'integration.title',
  },
};
