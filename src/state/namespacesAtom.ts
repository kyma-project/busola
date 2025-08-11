import { atom } from 'jotai';
export type NamespacesState = string[] | null;

const defaultValue = null;

export const namespacesState = atom<NamespacesState>(defaultValue);
namespacesState.debugLabel = 'namespacesState';
