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
  features: {
    SERVICE_CATALOG: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'servicecatalog.k8s.io',
        },
      ],
    },
    BTP_CATALOG: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'services.cloud.sap.com',
        },
      ],
    },
    SERVICE_CATALOG_ADDONS: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'servicecatalog.kyma-project.io',
        },
      ],
    },
    EVENTING: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'eventing.kyma-project.io',
        },
      ],
    },
    API_GATEWAY: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'gateway.kyma-project.io',
        },
      ],
    },
    APPLICATIONS: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'applicationconnector.kyma-project.io',
        },
      ],
    },
    ADDONS: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'addons.kyma-project.io',
        },
      ],
    },
    SERVERLESS: {
      selectors: [
        {
          type: 'apiGroup',
          apiGroup: 'serverless.kyma-project.io',
        },
      ],
    },
  },
  version: '2.0',
};

export async function generateDefaultParams() {
  const kubeconfig = await loadKubeconfig();
  const params = {
    kubeconfig,
    config: DEFAULT_CONFIG,
  };
  return await encoder.compress(params);
}

export async function generateParamsWithHiddenNamespacesList(namespaceName) {
  const kubeconfig = await loadKubeconfig();
  const params = {
    kubeconfig,
    config: {
      ...DEFAULT_CONFIG,
      hiddenNamespaces: [namespaceName],
    },
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

export async function generateParamsWithDisabledFeatures() {
  const kubeconfig = await loadKubeconfig();
  const config = DEFAULT_CONFIG;

  config.features.ADDONS = {
    isEnabled: false,
    selectors: [
      {
        type: 'apiGroup',
        apiGroup: 'servicecatalog.k8s.io',
      },
    ],
  };
  config.features.SERVERLESS = {
    selectors: [
      {
        type: 'apiGroup',
        apiGroup: 'api_group_that_doesnt_exist',
      },
    ],
  };

  const params = {
    kubeconfig,
    config,
  };
  return await encoder.compress(params);
}

export async function generateUnsupportedVersionParams() {
  const params = {
    kubeconfig: null,
    config: { ...DEFAULT_CONFIG, version: '0.0' },
  };
  return await encoder.compress(params);
}

export async function generateWithKubeconfigId(kubeconfigIdAddress) {
  const kubeconfig = await loadKubeconfig();
  const params = {
    kubeconfig: null,
    config: {
      ...DEFAULT_CONFIG,
      features: {
        KUBECONFIG_ID: {
          selectors: [],
          config: {
            kubeconfigUrl: kubeconfigIdAddress,
          },
        },
      },
    },
  };
  return { params: await encoder.compress(params), kubeconfig };
}

export function mockParamsEnabled() {
  const requestData = {
    method: 'GET',
    url: '/assets/config/config.json*',
  };
  const configMock = JSON.stringify({
    config: {
      features: {
        INIT_PARAMS: { isEnabled: true },
      },
    },
  });
  cy.intercept(requestData, configMock);
}
