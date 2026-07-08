import { atom } from 'jotai';

// True while a silent renew is in flight. Recovery paths check this so
// a transient 401 during renewal isn't treated as a session drop.
export const renewingAtom = atom<boolean>(false);
renewingAtom.debugLabel = 'renewingAtom';
