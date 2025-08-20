import { atomWithStorage } from 'jotai/utils';

const SHOW_HIDDEN_NAMESPACES_STORAGE_KEY = 'busola.showHiddenNamespaces';
const DEFAULT_SHOW_HIDDEN_NAMESPACES = true;

export const showHiddenNamespacesAtom = atomWithStorage<boolean>(
  SHOW_HIDDEN_NAMESPACES_STORAGE_KEY,
  DEFAULT_SHOW_HIDDEN_NAMESPACES,
);
showHiddenNamespacesAtom.debugLabel = 'showHiddenNamespacesAtom';
