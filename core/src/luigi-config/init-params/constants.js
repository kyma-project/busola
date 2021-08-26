const DEFAULT_MODULES = {
  SERVICE_CATALOG: 'servicecatalog.k8s.io',
  BTP_SERVICE_CATALOG: 'services.cloud.sap.com',
  SERVICE_CATALOG_ADDONS: 'servicecatalog.kyma-project.io',
  EVENTING: 'eventing.kyma-project.io',
  API_GATEWAY: 'gateway.kyma-project.io',
  APPLICATIONS: 'applicationconnector.kyma-project.io',
  ADDONS: 'addons.kyma-project.io',
  SERVERLESS: 'serverless.kyma-project.io',
  CUSTOM_DOMAINS: 'dnsproviders.dns.gardener.cloud',
};

export const DEFAULT_FEATURES = {
  ...Object.fromEntries(
    Object.entries(DEFAULT_MODULES).map(([key, value]) => [
      key,
      {
        selectors: [
          {
            type: 'apiGroup',
            apiGroup: value,
          },
        ],
      },
    ]),
  ),
  KUBECONFIG_ID: {
    config: {
      kubeconfigUrl: 'https://kyma-env-broker.cp.dev.kyma.cloud.sap/kubeconfig',
    },
  },
};

export const DEFAULT_HIDDEN_NAMESPACES = [
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
  'kubernetes-dashboard',
  'serverless-system',
];

export const PARAMS_VERSION = '2.0'; // make sure to sync it in shared
