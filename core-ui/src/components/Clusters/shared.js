import LuigiClient from '@luigi-project/client';
import { DEFAULT_MODULES } from 'react-shared';
import { merge } from 'lodash';

function getResponseParams(usePKCE = true) {
  if (usePKCE) {
    return {
      responseType: 'code',
      responseMode: 'query',
    };
  } else {
    return { responseType: 'id_token' };
  }
}

export function setCluster(clusterName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.setCluster',
    clusterName,
  });
}

export function addCluster(params) {
  const defaultParams = {
    config: {
      navigation: {
        disabledNodes: [],
        externalNodes: [],
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
      modules: DEFAULT_MODULES,
    },
  };

  params.currentContext = {
    cluster: params.kubeconfig.clusters[0],
    user: params.kubeconfig.users[0],
  };

  if (params.config?.auth) {
    params.config.auth = {
      ...params.config.auth,
      ...getResponseParams(params.config.auth.usePKCE),
    };
  }

  LuigiClient.sendCustomMessage({
    id: 'busola.addCluster',
    params: merge(defaultParams, params),
  });
}

export function deleteCluster(clusterName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.deleteCluster',
    clusterName,
  });
}

export function readFile(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsText(file);
  });
}
