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

export interface Pod extends K8sResource {
  spec: {
    containers: {
      name: string;
    }[];
  };
}
export interface Secret extends K8sResource {
  type: string;
}

export * from './kubeconfig';
