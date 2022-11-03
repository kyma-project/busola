import { atom, RecoilState } from 'recoil';

export type NamespacesState = {
  [key: string]: string[];
} | null;

const defaultValue = null;

export const namespacesState: RecoilState<NamespacesState> = atom<
  NamespacesState
>({
  key: 'namespacesState',
  default: defaultValue,
});
