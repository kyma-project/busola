import { atom } from 'jotai';

export const showTerminalAtom = atom<boolean>(false);
showTerminalAtom.debugLabel = 'showTerminalAtom';
