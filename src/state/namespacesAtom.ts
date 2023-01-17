import { atom, RecoilState } from 'recoil';

export type NamespacesState = string[];

const defaultValue: string[] = [];

export const namespacesState: RecoilState<NamespacesState> = atom<
  NamespacesState
>({
  key: 'namespacesState',
  default: defaultValue,
});
