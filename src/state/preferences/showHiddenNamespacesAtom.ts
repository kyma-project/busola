import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

type ShowHiddenNamespaces = boolean;

const SHOW_HIDDEN_NAMESPACES_STORAGE_KEY = 'busola.showHiddenNamespaces';
const DEFAULT_SHOW_HIDDEN_NAMESPACES = true;

export const showHiddenNamespacesState: RecoilState<ShowHiddenNamespaces> = atom<
  ShowHiddenNamespaces
>({
  key: 'showHiddenNamespacesState',
  default: DEFAULT_SHOW_HIDDEN_NAMESPACES,
  effects: [
    localStorageEffect<ShowHiddenNamespaces>(
      SHOW_HIDDEN_NAMESPACES_STORAGE_KEY,
    ),
  ],
});
