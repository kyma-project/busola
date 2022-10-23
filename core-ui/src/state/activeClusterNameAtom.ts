import { atom, RecoilState } from 'recoil';

type ActiveClusterNameState = string;

const defaultValue = '';

export const activeClusterNameState: RecoilState<ActiveClusterNameState> = atom<
  ActiveClusterNameState
>({
  key: 'activeClusterNameState',
  default: defaultValue,
});
