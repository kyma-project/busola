import { K8sAPIResource } from 'types';

export type ScanConfiguration = {
  description?: string;
  namespaces: string[];
  // resources: string[];
  policies: string[];
  scanParameters: {
    parallelRequests: number;
    // parallelWorkerThreads: number;
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
  resources: K8sAPIResource[],
  policies: string[],
): ScanConfiguration => {
  const userNamespaces =
    namespaces?.filter(name => !systemNamespaces.includes(name)) ?? [];
  return {
    namespaces: userNamespaces,
    // resources: resources?.map(({ kind }) => kind) ?? [],
    policies,
    scanParameters: {
      parallelRequests: 5,
      // parallelWorkerThreads: 1,
    },
  };
};
