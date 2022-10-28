export type Scope = 'namespace' | 'cluster';

export type ConfigFeature = {
  isEnabled?: boolean;
  stage?: 'PRIMARY' | 'SECONDARY';
  [key: string]: any;
};

export type ConfigFeaturesNames = typeof configFeaturesNames[keyof typeof configFeaturesNames];
export const configFeaturesNames = {
  BTP_CATALOG: 'BTP_CATALOG',
  EVENTING: 'EVENTING',
  API_GATEWAY: 'API_GATEWAY',
  APPLICATIONS: 'APPLICATIONS',
  SERVERLESS: 'SERVERLESS',
  CUSTOM_DOMAINS: 'CUSTOM_DOMAINS',
  ISTIO: 'ISTIO',
  PROMETHEUS: 'PROMETHEUS',
  APPLICATION_CONNECTOR_FLOW: 'APPLICATION_CONNECTOR_FLOW',
  LEGAL_LINKS: 'LEGAL_LINKS',
  SSO_LOGIN: 'SSO_LOGIN',
  KUBECONFIG_ID: 'KUBECONFIG_ID',
  SENTRY: 'SENTRY',
  OBSERVABILITY: 'OBSERVABILITY',
  HIDDEN_NAMESPACES: 'HIDDEN_NAMESPACES',
  VISUAL_RESOURCES: 'VISUAL_RESOURCES',
  EXTENSIBILITY: 'EXTENSIBILITY',
  TRACKING: 'TRACKING',
  REACT_NAVIGATION: 'REACT_NAVIGATION',
} as const;

export type ConfigFeatureList = {
  [key in ConfigFeaturesNames]?: ConfigFeature;
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
    icon?: string;
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

export type NavNode = {
  resourceType: string; // Jobs, CronJobs etc.
  category: string;
  namespaced: boolean;
  label: string;
  pathSegment: string;
  requiredFeatures: ConfigFeaturesNames[];
  apiVersion: string;
  apiGroup: string;
  icon?: string;
  topLevelNode?: boolean;
};
