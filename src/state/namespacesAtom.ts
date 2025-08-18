import { atom } from 'jotai';
export type NamespacesState = string[] | null;

const defaultValue = null;

export const namespacesAtom = atom<NamespacesState>(defaultValue);
namespacesAtom.debugLabel = 'namespacesAtom';
