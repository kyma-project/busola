import { atom, RecoilState } from 'recoil';

type ActiveNamespaceIdState = string;

//empty value here would mean '[*]' - all namespaces
export const defaultValue = '--no-namespace';

export const activeNamespaceIdState: RecoilState<ActiveNamespaceIdState> = atom<
  ActiveNamespaceIdState
>({
  key: 'ActiveNamespaceIdState',
  default: defaultValue,
});
