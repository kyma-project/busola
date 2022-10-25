import { atom, RecoilState } from 'recoil';
import { localStorageEffect, luigiMessageEffect } from '../utils/effects';

type ShowHiddenNamespaces = boolean;

const SHOW_HIDDEN_NAMESPACES_STORAGE_KEY = 'busola.showHiddenNamespaces';
const DEFAULT_SHOW_HIDDEN_NAMESPACES = false;

export const showHiddenNamespacesState: RecoilState<ShowHiddenNamespaces> = atom<
  ShowHiddenNamespaces
>({
  key: 'showHiddenNamespacesState',
  default: DEFAULT_SHOW_HIDDEN_NAMESPACES,
  effects: [
    localStorageEffect<ShowHiddenNamespaces>(
      SHOW_HIDDEN_NAMESPACES_STORAGE_KEY,
    ),
    luigiMessageEffect<ShowHiddenNamespaces>('busola.showHiddenNamespaces'),
  ],
});
