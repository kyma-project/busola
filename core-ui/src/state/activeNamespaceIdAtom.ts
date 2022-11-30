import { atom, RecoilState } from 'recoil';

type ActiveNamespaceIdState = string;

//empty value here would mean '[*]' - all namespaces
export const defaultValue = '';

export const activeNamespaceIdState: RecoilState<ActiveNamespaceIdState> = atom<
  ActiveNamespaceIdState
>({
  key: 'ActiveNamespaceIdState',
  default: defaultValue,
});
