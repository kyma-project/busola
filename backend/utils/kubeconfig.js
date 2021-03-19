import { KubeConfig } from '@kubernetes/client-node';

export function initializeKubeconfig() {
  const kubeconfigLocation = process.env.KUBECONFIG;
  const kubeconfig = new KubeConfig();

  console.log(kubeconfigLocation);
  if (kubeconfigLocation) kubeconfig.loadFromFile(kubeconfigLocation);
  else {
    try {
      kubeconfig.loadFromCluster();
    } catch (e) {
      console.warn('failed to load from cluster');
    }
  }

  // console.log("Using the following Kubeconfig: ", kubeconfig.exportConfig());

  return kubeconfig;
}
