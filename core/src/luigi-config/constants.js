import { apiGroup, discoverableFeatures } from './feature-discovery';
const DEFAULT_MODULES = {
  SERVICE_CATALOG: 'servicecatalog.k8s.io',
  BTP_CATALOG: 'services.cloud.sap.com',
  SERVICE_CATALOG_ADDONS: 'servicecatalog.kyma-project.io',
  EVENTING: 'eventing.kyma-project.io',
  API_GATEWAY: 'gateway.kyma-project.io',
  APPLICATIONS: 'applicationconnector.kyma-project.io',
  ADDONS: 'addons.kyma-project.io',
  SERVERLESS: 'serverless.kyma-project.io',
  CUSTOM_DOMAINS: 'dns.gardener.cloud',
  ISTIO: 'networking.istio.io',
  // PROMETHEUS: 'monitoring.coreos.com',
};

export const DEFAULT_FEATURES = {
  ...Object.fromEntries(
    Object.entries(DEFAULT_MODULES).map(([key, value]) => [
      key,
      {
        checks: [apiGroup(value)],
      },
    ]),
  ),
  ...discoverableFeatures,
};

export const DEFAULT_HIDDEN_NAMESPACES = [
  'compass-system',
  'istio-system',
  'knative-eventing',
  'knative-serving',
  'kube-public',
  'kube-system',
  'kyma-backup',
  'kyma-installer',
  'kyma-integration',
  'kyma-system',
  'natss',
  'kube-node-lease',
  'serverless-system',
];
