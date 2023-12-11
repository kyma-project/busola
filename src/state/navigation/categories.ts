import { NavNode } from '../types';

export type PredefinedCategories = typeof predefinedCategories[keyof typeof predefinedCategories];

export const predefinedCategories = {
  workloads: 'Workloads',
  'discovery-and-network': 'Discovery and Network',
  istio: 'Istio',
  'service-management': 'Service Management',
  storage: 'Storage',
  apps: 'Apps',
  configuration: 'Configuration',
  integration: 'Integration',
} as const;

export type Category = {
  key: PredefinedCategories;
  icon: string;
  label: string;
  items: NavNode[];

  topLevelNode?: boolean;
};
export const CATEGORIES: Category[] = [
  {
    key: predefinedCategories.workloads,
    icon: 'source-code',
    label: 'workloads.title',
    items: [],
  },
  {
    key: predefinedCategories['discovery-and-network'],
    icon: 'tnt/network',
    label: 'discovery-and-network.title',
    items: [],
  },
  {
    key: predefinedCategories.istio,
    icon: 'overview-chart',
    label: 'istio.title',
    items: [],
  },
  {
    key: predefinedCategories['service-management'],
    icon: 'tnt/application-service',
    label: 'service-management.title',
    items: [],
  },
  {
    key: predefinedCategories.storage,
    icon: 'shelf',
    label: 'storage.title',
    items: [],
  },
  {
    key: predefinedCategories.apps,
    icon: 'tnt/application',
    label: 'apps.title',
    items: [],
  },
  {
    key: predefinedCategories.configuration,
    icon: 'action-settings',
    label: 'configuration.title',
    items: [],
  },
  {
    key: predefinedCategories.integration,
    icon: 'overview-chart',
    label: 'integration.title',
    items: [],
  },
];
