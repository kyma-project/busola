import { atom } from 'jotai';

//empty value here would mean '[*]' - all namespaces
export const defaultValue = '';

export const activeNamespaceIdState = atom<string>(defaultValue);
activeNamespaceIdState.debugLabel = 'ActiveNamespaceIdState';
