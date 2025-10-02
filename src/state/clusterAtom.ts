import { atom } from 'jotai';
import { CurrentContext, ValidKubeconfig } from 'types';
import { CLUSTERS_STORAGE_KEY } from './clustersAtom';
import { ClusterStorage } from './types';

type ClusterConfig = {
  storage: ClusterStorage;
} | null;

export interface Cluster {
  config: ClusterConfig;
  contextName: string;
  currentContext: CurrentContext;
  kubeconfig: ValidKubeconfig;
}

interface ClusterWithName extends Cluster {
  name: string;
}

// undefined - cluster is not yet loaded
// null - no cluster choosen
export type ActiveClusterState = ClusterWithName | null | undefined;

const CLUSTER_NAME_STORAGE_KEY = 'busola.current-cluster-name';

const getClusters = () => {
  try {
    return {
      ...JSON.parse(localStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}'),
      ...JSON.parse(sessionStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}'),
    };
  } catch {
    return null;
  }
};

const getInitialClusterState = (): ActiveClusterState => {
  const clusters = getClusters();
  const clusterName = localStorage.getItem(CLUSTER_NAME_STORAGE_KEY);

  if (clusterName && !clusters?.[clusterName]) {
    localStorage.removeItem(CLUSTERS_STORAGE_KEY);
    return null;
  }

  if (!clusters || !clusterName) {
    return null;
  }

  return { ...clusters[clusterName], name: clusterName };
};

const baseClusterAtom = atom<ActiveClusterState>(getInitialClusterState());

// Main cluster atom with storage side effects
export const clusterAtom = atom<ActiveClusterState, [ActiveClusterState], void>(
  // Getter - read from base atom
  (get) => get(baseClusterAtom),

  // Setter - update base atom and handle storage
  (_, set, newCluster) => {
    // Update the base atom
    set(baseClusterAtom, newCluster);

    // Handle localStorage side effects
    if (newCluster) {
      localStorage.setItem(CLUSTER_NAME_STORAGE_KEY, newCluster.name);
    } else {
      localStorage.removeItem(CLUSTER_NAME_STORAGE_KEY);
    }
  },
);
clusterAtom.debugLabel = 'clusterAtom';
