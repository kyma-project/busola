import { atom } from 'jotai';

// True while any silent-renew is in flight; consumers gate recovery paths on it
// so a transient 401 during renewal isn't misread as a session drop.
export const renewingAtom = atom<boolean>(false);
renewingAtom.debugLabel = 'renewingAtom';
