import { atom, RecoilState } from 'recoil';

type ConfigState = {
  requiresCA: boolean;
  storage: 'localStorage' | 'sessionStorage' | string;
} | null;

const defaultValue: ConfigState = null;

export const clusterConfigState: RecoilState<ConfigState> = atom<ConfigState>({
  key: 'clusterConfigState',
  default: defaultValue,
});
