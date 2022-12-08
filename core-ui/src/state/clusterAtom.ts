import { atom, RecoilState } from 'recoil';
import { CurrentContext, ValidKubeconfig } from 'types';
import { CLUSTERS_STORAGE_KEY } from './clustersAtom';
import { ClusterStorage } from './types';

type ClusterConfig = {
  requiresCA: boolean;
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
const defaultValue = undefined;

export const clusterState: RecoilState<ActiveClusterState> = atom<
  ActiveClusterState
>({
  key: 'clusterState',
  default: defaultValue,
  effects: [
    ({ setSelf, onSet }) => {
      setSelf(() => {
        const getClusters = () => {
          try {
            return {
              ...JSON.parse(localStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}'),
              ...JSON.parse(
                sessionStorage.getItem(CLUSTERS_STORAGE_KEY) || '{}',
              ),
            };
          } catch {
            return null;
          }
        };

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
      });

      onSet(cluster => {
        if (cluster) {
          localStorage.setItem(CLUSTER_NAME_STORAGE_KEY, cluster.name);
        } else {
          localStorage.removeItem(CLUSTER_NAME_STORAGE_KEY);
        }
      });
    },
  ],
});
