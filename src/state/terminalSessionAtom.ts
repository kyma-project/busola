import { atom } from 'jotai';

export type TerminalSessionStatus =
  'idle' | 'provisioning' | 'connected' | 'error' | 'reconnecting';

export enum ConnectionType {
  Attach = 'attach',
  Exec = 'exec',
}

export type TerminalSessionState = {
  status: TerminalSessionStatus;
  podName: string | null;
  errorMessage: string | null;
  command: string;
  namespace: string;
  container?: string;
  connectionType: ConnectionType;
};

export const terminalSessionAtom = atom<TerminalSessionState>({
  status: 'idle',
  podName: null,
  errorMessage: null,
  command: 'bash',
  container: null,
  namespace: '',
  connectionType: ConnectionType.Attach,
});
terminalSessionAtom.debugLabel = 'terminalSessionAtom';
