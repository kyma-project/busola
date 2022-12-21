import { IconGlyph } from 'fundamental-react/lib/Icon/Icon';

export type Scope = 'namespace' | 'cluster';

export interface ConfigFeature {
  isEnabled?: boolean;
  stage?: 'PRIMARY' | 'SECONDARY';
  [key: string]: any;
}

export type ConfigFeaturesNames = typeof configFeaturesNames[keyof typeof configFeaturesNames];
export const configFeaturesNames = {
  BTP_CATALOG: 'BTP_CATALOG',
  EVENTING: 'EVENTING',
  API_GATEWAY: 'API_GATEWAY',
  SERVERLESS: 'SERVERLESS',
  CUSTOM_DOMAINS: 'CUSTOM_DOMAINS',
  ISTIO: 'ISTIO',
  LEGAL_LINKS: 'LEGAL_LINKS',
  SENTRY: 'SENTRY',
  KUBECONFIG_ID: 'KUBECONFIG_ID',
  OBSERVABILITY: 'OBSERVABILITY',
  HIDDEN_NAMESPACES: 'HIDDEN_NAMESPACES',
  VISUAL_RESOURCES: 'VISUAL_RESOURCES',
  EXTENSIBILITY: 'EXTENSIBILITY',
  TRACKING: 'TRACKING',
  REACT_NAVIGATION: 'REACT_NAVIGATION',
  PROTECTED_RESOURCES: 'PROTECTED_RESOURCES',
  EXTERNAL_NODES: 'EXTERNAL_NODES',
  PROMETHEUS: 'PROMETHEUS',
  GARDENER_LOGIN: 'GARDENER_LOGIN',
} as const;

export type ConfigFeatureList = {
  [key in ConfigFeaturesNames]?: ConfigFeature;
};

export type LazyConfigFeaturesNames = typeof lazyConfigFeaturesNames[keyof typeof lazyConfigFeaturesNames];
export const lazyConfigFeaturesNames = {
  PROMETHEUS: 'PROMETHEUS',
} as const;
export type LazyConfigFeatureList = {
  [key in LazyConfigFeaturesNames]?: ConfigFeature;
};

export type ExtResource = {
  general: {
    resource: {
      kind: string;
      group: string;
      version: string;
    };
    name: string;
    category: string;
    urlPath: string;
    scope: 'namespace' | 'cluster';
    description?: string;
    icon?: IconGlyph;
  };
  list: any[];
  details: {
    header: any[];
    body: any[];
  };
  form: any[];
  translations: Record<string, any>;
  presets: any[];
  dataSources: Record<string, any>;
};

export interface UrlGenerators {
  cluster: string;
  namespace: string;
  clusterUrl: (path: string) => string;
  namespaceUrl: (path: string) => string;
  scopedUrl: (path: string) => string;
  resourceListUrl: (path: string) => string;
  resourceUrl: (path: string) => string;
}

export type NavNode = {
  resourceType: string; // Jobs, CronJobs etc.
  category: string;
  namespaced: boolean;
  label: string;
  pathSegment: string;
  requiredFeatures: ConfigFeaturesNames[];
  apiVersion: string;
  apiGroup: string;
  icon?: IconGlyph;
  topLevelNode?: boolean;
  externalUrl?: string;
  createUrlFn?: (generators: UrlGenerators) => string;
};

export type ClusterStorage = 'localStorage' | 'sessionStorage' | string;
