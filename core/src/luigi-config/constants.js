import { apiGroup, service, xprod3 } from './feature-discovery';

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
  PROMETHEUS: {
    initial: false,
    checks: [
      apiGroup('monitoring.coreos.com'),
      service(
        (config, feature) => {
          return xprod3(
            feature.namespaces,
            feature.serviceNames,
            feature.portNames,
          ).map(
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
console.log('DEFAULT_FEATURES', DEFAULT_FEATURES);

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
