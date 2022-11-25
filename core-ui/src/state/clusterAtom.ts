import { atom, RecoilState } from 'recoil';
import { AuthDataState } from './authDataAtom';

type ClusterConfigState = {
  requiresCA: boolean;
  storage: 'localStorage' | 'sessionStorage' | string;
} | null;

export type ClusterState = {
  config: ClusterConfigState;
  contextName: string;
  currentContext: {
    cluster: {
      cluster: {
        server: string;
        'certificate-authority-data': string;
      };
      name: string;
    };
    user: {
      name: string;
      user: AuthDataState;
    };
  };
  kubeconfig: any;
  name: string;
} | null;

const defaultValue = null;

export const clusterState: RecoilState<ClusterState> = atom<ClusterState>({
  key: 'clusterState',
  default: defaultValue,
  effects: [
    ({ setSelf, onSet }) => {
      setSelf(previousValue => {
        console.log({ previousValue });
        return previousValue;
      });

      onSet(newValue => {
        console.log('set', newValue);
      });
    },
  ],
});
