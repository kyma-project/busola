import { Terminal } from '@xterm/xterm';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { TerminalSessionState } from 'state/terminalSessionAtom';
import { TERMINAL_NAMESPACE, CONTAINER_NAME } from './provisionPod';

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

function encodeBase64Url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function buildProtocols(authHeaders: Record<string, string>): string[] {
  return [
    'v4.channel.k8s.io',
    ...Object.entries(authHeaders).map(
      ([key, value]) =>
        `base64url.header.${key.toLowerCase()}.${encodeBase64Url(value)}`,
    ),
  ];
}

function buildAttachUrl(podName: string): string {
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
  });
  return `${wsProtocol}//${host}${backendAddress}/ws${attachPath}?${params}`;
}

// Auth headers are encoded into Sec-WebSocket-Protocol because the browser
// WebSocket API has no headers parameter. The backend (#4920) decodes them
// and uses them to proxy the attach to the cluster.
export async function connectTerminal({
  authHeaders,
  term,
  podName,
  setSession,
  signal,
}: {
  authHeaders: Record<string, string>;
  term: Terminal;
  podName: string;
  setSession: (
    update: (prev: TerminalSessionState) => TerminalSessionState,
  ) => void;
  signal: AbortSignal;
}): Promise<{ ws: WebSocket; disposable: { dispose: () => void } }> {
  const ws = new WebSocket(
    buildAttachUrl(podName),
    buildProtocols(authHeaders),
  );
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
