import { K8sAPIResource } from 'types';

export type ScanConfiguration = {
  description?: string;
  namespaces: string[];
  resources: string[];
  policies: string[];
  scanParameters: {
    parallelRequests: number;
    parallelWorkerThreads: number;
  };
};

const systemNamespaces = [
  'istio-system',
  'kube-node-lease',
  'kube-public',
  'kube-system',
  'kyma-system',
];
const defaultResources = ['Pod', 'Deployment'];

export const getDefaultScanConfiguration = (
  namespaces: string[],
  resources: K8sAPIResource[],
  policies: string[],
): ScanConfiguration => {
  const userNamespaces =
    namespaces?.filter(name => !systemNamespaces.includes(name)) ?? [];
  return {
    namespaces: userNamespaces,
    resources:
      resources
        ?.filter(({ kind }) => defaultResources.includes(kind))
        .map(({ kind }) => kind) ?? [],
    policies: [],
    scanParameters: {
      parallelRequests: 5,
      parallelWorkerThreads: 1,
    },
  };
};
