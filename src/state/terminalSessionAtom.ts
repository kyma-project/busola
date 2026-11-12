import { atom } from 'jotai';

export type TerminalSessionStatus =
  | 'idle'
  | 'provisioning'
  | 'provisioned'
  | 'connected'
  | 'error'
  | 'reconnecting';

export enum ConnectionType {
  Attach = 'attach',
  Exec = 'exec',
}

export type TerminalSessionState = {
  status: TerminalSessionStatus;
  abortController: AbortController | null;
  podName: string;
  errorMessage: string | null;
  command: string;
  namespace: string;
  container: string;
  connectionType: ConnectionType;
  deprovisionPod: () => Promise<void>;
};

export const terminalSessionAtom = atom<TerminalSessionState>({
  status: 'idle',
  podName: '',
  errorMessage: null,
  command: 'bash',
  container: '',
  namespace: '',
  connectionType: ConnectionType.Attach,
  abortController: null,
  deprovisionPod: async () => {},
});
terminalSessionAtom.debugLabel = 'terminalSessionAtom';
