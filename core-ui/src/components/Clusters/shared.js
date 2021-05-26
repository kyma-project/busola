import LuigiClient from '@luigi-project/client';
import { DEFAULT_MODULES } from 'react-shared';
import { merge } from 'lodash';

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
        disabledNodes: '',
        externalNodes: [],
      },
      systemNamespaces: 'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system'.split(
        ' ',
      ),
      modules: DEFAULT_MODULES,
    },
  };

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
