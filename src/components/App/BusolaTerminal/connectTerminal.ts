import { Terminal } from '@xterm/xterm';
import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { TerminalSessionState } from 'state/terminalSessionAtom';
import { TERMINAL_NAMESPACE, CONTAINER_NAME } from './provisionPod';

const ATTACH_SUBPROTOCOL = 'v4.channel.k8s.io';

// Kubernetes attach stream channels — the first byte of every frame.
const STDIN_CHANNEL = 0;
const STDOUT_CHANNEL = 1;
const STDERR_CHANNEL = 2;

const ANSI_RESET = '\x1b[0m';
export const COLOR_SUCCESS = '\x1b[32m';
export const COLOR_WARNING = '\x1b[33m';
export const COLOR_ERROR = '\x1b[31m';

// \r returns the cursor to column 0 — xterm is in raw mode, so a lone \n staircases.
export const LINE_BREAK = '\r\n';

export function terminalMessage(color: string, text: string) {
  return `${LINE_BREAK}${color}${text}${ANSI_RESET}${LINE_BREAK}`;
}

function buildAttachUrl(podName: string, wsToken: string): string {
  const { protocol, host } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const { backendAddress } = getClusterConfig();
  const attachPath = `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}/attach`;
  const params = new URLSearchParams({
    container: CONTAINER_NAME,
    stdin: 'true',
    stdout: 'true',
    stderr: 'true',
    tty: 'true',
    wsToken,
  });
  return `${wsProtocol}//${host}${backendAddress}/ws${attachPath}?${params}`;
}

// WebSocket handshakes can't carry headers, so credentials are first swapped
// for a short-lived token the backend (#4920) replays on the attach upgrade.
export async function connectTerminal({
  fetchFn,
  term,
  podName,
  setSession,
  signal,
}: {
  fetchFn: FetchFn;
  term: Terminal;
  podName: string;
  setSession: (
    update: (prev: TerminalSessionState) => TerminalSessionState,
  ) => void;
  signal: AbortSignal;
}): Promise<{ ws: WebSocket; disposable: { dispose: () => void } }> {
  const tokenRes = await fetchFn({
    relativeUrl: '/ws-token',
    init: { method: 'POST' },
  });
  const { token: wsToken } = await tokenRes.json();

  const ws = new WebSocket(buildAttachUrl(podName, wsToken), [
    ATTACH_SUBPROTOCOL,
  ]);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    if (signal.aborted) return;
    setSession((prev) => ({ ...prev, status: 'connected' }));
    term.write(terminalMessage(COLOR_SUCCESS, 'Connected to terminal.'));
  };

  ws.onmessage = (event) => {
    const data = new Uint8Array(event.data as ArrayBuffer);
    if (data[0] === STDOUT_CHANNEL || data[0] === STDERR_CHANNEL) {
      term.write(data.slice(1));
    }
  };

  ws.onclose = () => {
    if (signal.aborted) return;
    setSession((prev) => ({ ...prev, status: 'idle' }));
    term.write(terminalMessage(COLOR_WARNING, 'Connection closed.'));
  };

  ws.onerror = () => {
    if (signal.aborted) return;
    setSession((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: 'WebSocket connection error.',
    }));
  };

  const disposable = term.onData((input) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const bytes = new TextEncoder().encode(input);
    const frame = new Uint8Array(bytes.length + 1);
    frame[0] = STDIN_CHANNEL;
    frame.set(bytes, 1);
    ws.send(frame);
  });

  return { ws, disposable };
}
