export interface K8sResource {
  kind?: string;
  metadata: {
    name: string;
    uid: string;
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

export type NestedPartial<K> = {
  [attr in keyof K]?: K[attr] extends object
    ? NestedPartial<K[attr]>
    : K[attr] extends object | null
    ? NestedPartial<K[attr]> | null
    : K[attr] extends object | null | undefined
    ? NestedPartial<K[attr]> | null | undefined
    : K[attr];
};

export * from './kubeconfig';
