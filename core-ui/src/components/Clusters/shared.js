import LuigiClient from '@luigi-project/client';

export function setCluster(clusterName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.setCluster',
    clusterName,
  });
}

export function addCluster(params) {
  const defaultParams = {
    config: {
      disabledNavigationNodes: '',
      systemNamespaces: 'istio-system knative-eventing knative-serving kube-public kube-system kyma-backup kyma-installer kyma-integration kyma-system natss kube-node-lease kubernetes-dashboard serverless-system'.split(
        ' ',
      ),
      modules: [], //todo po mergu
    },
    features: {
      bebEnabled: false,
    },
  };

  LuigiClient.sendCustomMessage({
    id: 'busola.addCluster',
    params: { ...params, ...defaultParams },
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
