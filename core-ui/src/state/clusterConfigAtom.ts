import { atom, RecoilState } from 'recoil';

export type ClusterConfigState = {
  requiresCA: boolean;
  storage: 'localStorage' | 'sessionStorage' | string;
} | null;

export const clusterConfigState: RecoilState<ClusterConfigState> = atom<
  ClusterConfigState
>({
  key: 'clusterConfigState',
});
