import { atom } from 'jotai';

export type TerminalState = {
  isDocked: boolean;
  isFullscreen: boolean;
  isOpen: boolean;
  dockedHeight: number;
};

export const showTerminalAtom = atom<TerminalState>({
  isDocked: true,
  isFullscreen: false,
  isOpen: false,
  dockedHeight: 0,
});
showTerminalAtom.debugLabel = 'showTerminalAtom';
