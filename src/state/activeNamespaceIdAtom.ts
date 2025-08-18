import { atom } from 'jotai';

//empty value here would mean '[*]' - all namespaces
const defaultValue = '';

export const activeNamespaceIdAtom = atom<string>(defaultValue);
activeNamespaceIdAtom.debugLabel = 'activeNamespaceIdAtom';
