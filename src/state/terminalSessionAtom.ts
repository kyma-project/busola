import { atom } from 'jotai';

export const TerminalSessionStatus = {
  Idle: 'idle',
  Provisioning: 'provisioning',
  Provisioned: 'provisioned',
  Connected: 'connected',
  Error: 'error',
  Reconnecting: 'reconnecting',
  Recreating: 'recreating',
} as const;

export type TerminalSessionStatus =
  (typeof TerminalSessionStatus)[keyof typeof TerminalSessionStatus];

export const ConnectionType = {
  Attach: 'attach',
  Exec: 'exec',
} as const;

export type ConnectionType =
  (typeof ConnectionType)[keyof typeof ConnectionType];

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
  status: TerminalSessionStatus.Idle,
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
