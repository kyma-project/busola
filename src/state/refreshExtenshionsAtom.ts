import { atom } from 'jotai';

const defaultValue = 0;

export const refreshExtenshionsAtom = atom<number>(defaultValue);
refreshExtenshionsAtom.debugLabel = 'refreshExtenshionsAtom';
