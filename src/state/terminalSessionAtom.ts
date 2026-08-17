import { atom } from 'jotai';

export type TerminalSessionStatus =
  | 'idle'
  | 'provisioning'
  | 'connected'
  | 'error'
  | 'reconnecting';

export type TerminalSessionState = {
  status: TerminalSessionStatus;
  podName: string | null;
  errorMessage: string | null;
};

export const terminalSessionAtom = atom<TerminalSessionState>({
  status: 'idle',
  podName: null,
  errorMessage: null,
});
terminalSessionAtom.debugLabel = 'terminalSessionAtom';
