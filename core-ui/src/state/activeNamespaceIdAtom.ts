import { atom, RecoilState } from 'recoil';

type ActiveNamespaceIdState = string;

const defaultValue = '';

export const activeNamespaceIdState: RecoilState<ActiveNamespaceIdState> = atom<
  ActiveNamespaceIdState
>({
  key: 'ActiveNamespaceIdState',
  default: defaultValue,
});
