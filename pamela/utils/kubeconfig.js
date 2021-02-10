import { KubeConfig } from '@kubernetes/client-node';

export function initializeKubeconfig() {
  const kubeconfigLocation = process.env.KUBECONFIG;
  const domain = process.env.REACT_APP_domain;
  const kubeconfig = new KubeConfig();

  if (kubeconfigLocation) kubeconfig.loadFromFile(kubeconfigLocation);
  else if (domain) {
    const cluster = {
      name: 'my-server',
      server: `http://api.${domain}`,
    };

    const context = {
      name: 'my-context',
      cluster: cluster.name,
    };

    kubeconfig.loadFromOptions({
      clusters: [cluster],
      contexts: [context],
      currentContext: context.name,
    });
  } else kubeconfig.loadFromCluster();

  // console.log("Using the following Kubeconfig: ", kubeconfig.exportConfig());

  return kubeconfig;
}
