export type KubeconfigNonOIDCAuth =
  | { 'client-certificate-data': string; 'client-key-data': string }
  | {
      token: string;
    };

export type LoginCommand = {
  apiVersion: 'client.authentication.k8s.io/v1beta1';
  command: string;
  args: Array<string>;
};

export type KubeconfigOIDCAuth = {
  exec: LoginCommand;
};

export type KubeconfigUser = {
  name: string;
  user: KubeconfigNonOIDCAuth | KubeconfigOIDCAuth;
};

export type KubeconfigContext = {
  name: string;
  context: {
    cluster: string;
    user: string;
    namespace?: string;
  };
};

export type KubeconfigCluster = {
  name: string;
  cluster: {
    server: string;
    'certificate-authority-data': string;
  };
};

export type ValidKubeconfig = {
  apiVersion: 'v1';
  kind: 'Config';
  'current-context': string;
  users: Array<KubeconfigUser>;
  contexts: Array<KubeconfigContext>;
  clusters: Array<KubeconfigCluster>;
  preferences?: any;
};

export type CurrentContext = {
  cluster: KubeconfigCluster;
  user: KubeconfigUser;
  namespace?: string;
};

type NestedPartial<K> = {
  [attr in keyof K]?: K[attr] extends object
    ? NestedPartial<K[attr]>
    : K[attr] extends object | null
    ? NestedPartial<K[attr]> | null
    : K[attr] extends object | null | undefined
    ? NestedPartial<K[attr]> | null | undefined
    : K[attr];
};

// assume user's kubeconfig might be incomplete
export type Kubeconfig = NestedPartial<ValidKubeconfig>;
