import { atom, RecoilState } from 'recoil';

export type ClustersState = {
  [key: string]: {
    config: {
      storage: string;
      requiresCA: boolean;
    };
    contextName: string;
    currentContext: {
      cluster: {};
      name: string;
    };
    kubeconfig: {
      kubeconfig: {};
      name: string;
    };
  };
} | null;

const defaultValue = null;

export const clustersState: RecoilState<ClustersState> = atom<ClustersState>({
  key: 'clustersState',
  default: defaultValue,
});
