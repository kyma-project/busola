import { arrayCombine } from './feature-discovery';
import { apiGroup, service } from './feature-checks';
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

// todo: initial should have 3 possible values:
// PRIMARY - laoded during the app boostrap (e.g. nav nodes for resources)
// SECONDARY - loaded immediately after app bootstraps (e.g. observability)
// <other> - lazy loaded (e.g. prometheus)

export const DEFAULT_FEATURES = {
  ...Object.fromEntries(
    Object.entries(DEFAULT_MODULES).map(([key, value]) => [
      key,
      {
        checks: [apiGroup(value)],
        initial: true,
        showInNavigation: true, // indicates that when the feature config changes navigation should be reloaded
      },
    ]),
  ),
  PROMETHEUS: {
    initial: false,
    checks: [
      apiGroup('monitoring.coreos.com'),
      service(
        (config, feature) => {
          return arrayCombine([
            feature.namespaces,
            feature.serviceNames,
            feature.portNames,
          ]).map(
            ([namespace, serviceName, portName]) =>
              `api/v1/namespaces/${namespace}/services/${serviceName}:${portName}/proxy/api/v1`,
          );
        },
        undefined,
        url => `${url}/status/runtimeinfo`,
      ),
    ],
    namespaces: ['kyma-system'],
    serviceNames: ['monitoring-prometheus', 'prometheus'],
    portNames: ['web', 'http-web'],
  },
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
