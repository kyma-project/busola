import { atom } from 'jotai';

const DEFAULT_SESSION_ID = '';

export const sessionIDState = atom<string>(DEFAULT_SESSION_ID);
sessionIDState.debugLabel = 'sessionIDState';
