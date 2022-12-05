export type K8sResource = {
  kind?: string;
  metadata: {
    name: string;
    creationTimestamp: string;
    resourceVersion: string;
    namespace?: string;
  };
};

export * from './kubeconfig';
