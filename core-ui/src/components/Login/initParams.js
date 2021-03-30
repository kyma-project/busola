import LuigiClient from '@luigi-project/client';

const defaultParams = {
  config: {
    disabledNavigationNodes: '',
    systemNamespaces: 'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system'.split(
      ' ',
    ),
  },
  features: {
    bebEnabled: false,
  },
};

export function saveInitParams(params) {
  LuigiClient.sendCustomMessage({
    id: 'busola.setInitParams',
    params: {
      ...params,
      ...defaultParams,
    },
  });
}
