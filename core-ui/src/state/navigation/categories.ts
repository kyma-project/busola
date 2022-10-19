import { NavNode } from '../types';

export enum PredefinedCategories {
  'workloads' = 'Workloads',
  'discovery-and-network' = 'Discovery-and-network',
  'istio' = 'Istio',
  'service-management' = 'Service-management',
  'storage' = 'Storage',
  'apps' = 'Apps',
  'configuration' = 'Configuration',
  'integration' = 'Integration',
}

export type Category = {
  key: PredefinedCategories | string;
  icon: string;
  label: string;
  items: NavNode[];
  topLevelNode?: boolean;
};
export const CATEGORIES: Category[] = [
  {
    key: PredefinedCategories.workloads,
    icon: 'source-code',
    label: 'workloads.title',
    items: [],
  },
  {
    key: PredefinedCategories['discovery-and-network'],
    icon: 'instance',
    label: 'discovery-and-network.title',
    items: [],
  },
  {
    key: PredefinedCategories.istio,
    icon: 'overview-chart',
    label: 'istio.title',
    items: [],
  },
  {
    key: PredefinedCategories['service-management'],
    icon: 'add-coursebook',
    label: 'service-management.title',
    items: [],
  },
  {
    key: PredefinedCategories.storage,
    icon: 'sap-box',
    label: 'storage.title',
    items: [],
  },
  {
    key: PredefinedCategories.apps,
    icon: 'example',
    label: 'apps.title',
    items: [],
  },
  {
    key: PredefinedCategories.configuration,
    icon: 'settings',
    label: 'configuration.title',
    items: [],
  },
  {
    key: PredefinedCategories.integration,
    icon: 'overview-chart',
    label: 'integration.title',
    items: [],
  },
];
