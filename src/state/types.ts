import { DataSources } from 'components/Extensibility/contexts/DataSources';
import { K8sResource } from 'types';

export type Scope = 'namespace' | 'cluster';

export interface ConfigFeature {
  isEnabled?: boolean;
  stage?: 'PRIMARY' | 'SECONDARY';
  [key: string]: any;
}

export type ConfigFeaturesNames = typeof configFeaturesNames[keyof typeof configFeaturesNames];
export const configFeaturesNames = {
  EVENTING: 'EVENTING',
  API_GATEWAY: 'API_GATEWAY',
  ISTIO: 'ISTIO',
  LEGAL_LINKS: 'LEGAL_LINKS',
  GET_HELP_LINKS: 'GET_HELP_LINKS',
  SENTRY: 'SENTRY',
  KUBECONFIG_ID: 'KUBECONFIG_ID',
  HIDDEN_NAMESPACES: 'HIDDEN_NAMESPACES',
  VISUAL_RESOURCES: 'VISUAL_RESOURCES',
  EXTENSIBILITY: 'EXTENSIBILITY',
  EXTENSIBILITY_INJECTIONS: 'EXTENSIBILITY_INJECTIONS',
  EXTENSIBILITY_WIZARD: 'EXTENSIBILITY_WIZARD',
  TRACKING: 'TRACKING',
  PROTECTED_RESOURCES: 'PROTECTED_RESOURCES',
  EXTERNAL_NODES: 'EXTERNAL_NODES',
  GARDENER_LOGIN: 'GARDENER_LOGIN',
  RESOURCE_VALIDATION: 'RESOURCE_VALIDATION',
  CLUSTER_VALIDATION: 'CLUSTER_VALIDATION',
  FEEDBACK: 'FEEDBACK',
  SNOW: 'SNOW',
} as const;

export type ConfigFeatureList = {
  [key in ConfigFeaturesNames]?: ConfigFeature;
};

export type ExtInjection = {
  name: string;
  widget: string;
  source: string;
  slot: 'top' | 'bottom';
  destination: string;
  resource: {
    kind: string;
    group: string;
    version: string;
  };
};

export type ExtInjectionConfig = {
  injection: ExtInjection;
  general: ExtGeneral;
  dataSources: Record<string, any>;
};

export type ExtWizardConfig = {
  injections: ExtInjection;
  general: ExtGeneral;
  steps: ExtWizardSteps;
};

export type ExtWizardSteps = {
  name: string;
  description: string;
  resource: string;
  form: any[];
};

export type ExtGeneral = {
  resource: {
    kind: string;
    group: string;
    version: string;
  };
  type: string;
  name: string;
  category: string;
  urlPath: string;
  scope: 'namespace' | 'cluster';
  description?: string;
  icon?: string;
  id?: string;
  externalNodes?: ExtensibilityNodesExt[];
};

export type ExtResource = {
  general: ExtGeneral;
  list: any[];
  details: {
    header: any[];
    body: any[];
  };
  form: any[];
  translations: Record<string, any>;
  presets: any[];
  dataSources: Record<string, any>;
  injections?: ExtInjection[];
  customHtml: {};
  customScript: {};
};

export type ExtensibilityNodesExt = {
  category: string;
  scope: 'namespace' | 'cluster';
  icon: string;
  children: {
    label: string;
    link: string;
  }[];
  dataSources: DataSources;
};

export interface UrlOverrides {
  cluster?: string;
  namespace?: string;
  resourceType?: string;
}

type UrlFunction = (path: string, overrides?: UrlOverrides) => string;

export interface UrlGenerators {
  cluster: string;
  namespace: string;
  clusterUrl: UrlFunction;
  namespaceUrl: UrlFunction;
  scopedUrl: UrlFunction;
  resourceListUrl: (resource: K8sResource, overrides?: UrlOverrides) => string;
  resourceUrl: (resource: K8sResource, overrides?: UrlOverrides) => string;
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
  icon?: string;
  topLevelNode?: boolean;
  externalUrl?: string;
  createUrlFn?: (generators: UrlGenerators) => string;
  aliases?: string[];
  dataSources?: DataSources;
};

export type ClusterStorage = 'localStorage' | 'sessionStorage' | string;
