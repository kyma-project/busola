export type ScanConfiguration = {
  description?: string;
  namespaces: string[];
  policies: string[];
  scanParameters?: {
    parallelRequests?: number;
  };
};

const systemNamespaces = [
  'istio-system',
  'kube-node-lease',
  'kube-public',
  'kube-system',
  'kyma-system',
];

export const getDefaultScanConfiguration = (
  namespaces: string[],
  policies: string[],
): ScanConfiguration => {
  const userNamespaces =
    namespaces?.filter(name => !systemNamespaces.includes(name)) ?? [];
  return {
    namespaces: userNamespaces,
    policies,
    scanParameters: {
      parallelRequests: 5,
    },
  };
};
