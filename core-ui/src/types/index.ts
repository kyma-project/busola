export type K8sResource = {
  metadata: {
    name: string;
    creationTimestamp: string;
    resourceVersion: string;
  };
};

export * from './kubeconfig';
