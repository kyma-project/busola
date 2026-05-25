import { atom } from 'jotai';

export type TerminalState = {
  isDocked: boolean;
  isFullscreen: boolean;
  isOpen: boolean;
};

export const showTerminalAtom = atom<TerminalState>({
  isDocked: true,
  isFullscreen: false,
  isOpen: false,
});
showTerminalAtom.debugLabel = 'showTerminalAtom';
