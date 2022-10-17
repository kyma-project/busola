export enum PredefinedCategories {
  'workloads' = 'Workloads',
  'discovery-and-network' = 'Discovery-and-network',
  'istio' = 'Istio',
  'service-management' = 'Service-management',
  'storage' = 'Storage',
  'apps' = 'Apps',
  'configuration' = 'Configuration',
  'integration' = 'Integration',
  'temporary' = 'Temporary',
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
