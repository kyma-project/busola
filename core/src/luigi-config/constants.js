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
};

function arrayCombine(arrays) {
  const _arrayCombine = (arrs, current = []) => {
    if (arrs.length === 1) {
      return arrs[0].map(e => [...current, e]);
    } else {
      return arrs[0].map(e => _arrayCombine(arrs.slice(1), [...current, e]));
    }
  };

  return _arrayCombine(arrays).flat(arrays.length - 1);
}

export const DEFAULT_FEATURES = {
  ...Object.fromEntries(
    Object.entries(DEFAULT_MODULES).map(([featureName, group]) => [
      featureName,
      {
        checks: [apiGroup({ group })],
        stage: 'PRIMARY',
        updateNodes: true, // indicates that when the feature config changes nodes should be reloaded
      },
    ]),
  ),
  PROMETHEUS: {
    checks: [
      apiGroup({ group: 'monitoring.coreos.com' }),
      service({
        urlsGenerator: featureConfig => {
          return arrayCombine([
            featureConfig.namespaces,
            featureConfig.serviceNames,
            featureConfig.portNames,
          ]).map(
            ([namespace, serviceName, portName]) =>
              `/api/v1/namespaces/${namespace}/services/${serviceName}:${portName}/proxy/api/v1`,
          );
        },
        urlMutator: url => `${url}/status/runtimeinfo`,
      }),
    ],
    namespaces: ['kyma-system'],
    serviceNames: ['monitoring-prometheus', 'prometheus'],
    portNames: ['web', 'http-web'],
  },
};
