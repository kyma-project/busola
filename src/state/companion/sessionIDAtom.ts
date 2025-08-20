import { atom } from 'jotai';

const DEFAULT_SESSION_ID = '';

export const sessionIDAtom = atom<string>(DEFAULT_SESSION_ID);
sessionIDAtom.debugLabel = 'sessionIDAtom';
