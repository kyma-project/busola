import { atom, RecoilState } from 'recoil';

export type ClustersState = {
  [clusterName: string]: {
    config: {
      storage: string;
      requiresCA: boolean;
    };
    contextName: string;
    currentContext: {
      cluster: object; // todo add type
      name: string;
    };
    kubeconfig: {
      kubeconfig: object; // todo add type
      name: string;
    };
  };
} | null;

const defaultValue = null;

export const clustersState: RecoilState<ClustersState> = atom<ClustersState>({
  key: 'clustersState',
  default: defaultValue,
});
