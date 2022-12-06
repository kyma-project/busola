export interface K8sResource {
  kind?: string;
  metadata: {
    name: string;
    creationTimestamp: string;
    resourceVersion: string;
    namespace?: string;
    labels: Record<string, string>;
  };
}

export * from './kubeconfig';
