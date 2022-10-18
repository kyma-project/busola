import { atom, RecoilState } from 'recoil';

type ClusterState = {
  cluster: {
    server: string;
    'certificate-authority-data': string;
  };
  name: string;
} | null;

const defaultValue = null;

export const clusterState: RecoilState<ClusterState> = atom<ClusterState>({
  key: 'clusterState',
  default: defaultValue,
});
