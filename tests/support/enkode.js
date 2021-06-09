import createEncoder from 'json-url';
import { loadKubeconfig } from './loadKubeconfigFile';

const encoder = createEncoder('lzma');

const DEFAULT_CONFIG = {
  navigation: {
    disabledNodes: [],
    externalNodes: [
      {
        category: 'Learn more',
        icon: 'course-book',
        children: [
          {
            label: 'Kyma Documentation',
            link: 'https://kyma-project.io/docs/',
          },
          {
            label: 'Our Slack',
            link: 'http://slack.kyma-project.io/',
          },
          {
            label: 'Github',
            link: 'https://github.com/kyma-project/',
          },
        ],
      },
    ],
  },
  hiddenNamespaces: [
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
  ],
  modules: {
    SERVICE_CATALOG: 'servicecatalog.k8s.io',
    SERVICE_CATALOG_ADDONS: 'servicecatalog.kyma-project.io',
    EVENTING: 'eventing.kyma-project.io',
    API_GATEWAY: 'gateway.kyma-project.io',
    APPLICATIONS: 'applicationconnector.kyma-project.io',
    ADDONS: 'addons.kyma-project.io',
    SERVERLESS: 'serverless.kyma-project.io',
  },
};

export async function generateDefaultParams() {
  const kubeconfig = await loadKubeconfig();
  const params = {
    kubeconfig,
    config: DEFAULT_CONFIG,
  };
  return await encoder.compress(params);
}

export async function generateParamsWithPreselectedNamespace() {
  const kubeconfig = await loadKubeconfig();
  kubeconfig.contexts[0].context.namespace = 'default';
  const params = {
    kubeconfig,
    config: DEFAULT_CONFIG,
  };
  return await encoder.compress(params);
}

export async function generateParamsWithNoKubeconfig() {
  const customExternalNodes = [
    {
      category: 'Testing Busola',
      children: [{ label: 'Test nav node', link: '#' }],
    },
  ];

  const params = {
    config: {
      ...DEFAULT_CONFIG,
      navigation: {
        ...DEFAULT_CONFIG.navigation,
        externalNodes: customExternalNodes,
      },
    },
  };

  return await encoder.compress(params);
}

export async function generateParamsAndToken() {
  const kubeconfig = await loadKubeconfig();
  const token = kubeconfig.users[0].user.token;
  kubeconfig.users[0].user.token = null;
  const params = {
    kubeconfig,
    config: DEFAULT_CONFIG,
  };
  return { token, params: await encoder.compress(params) };
}
