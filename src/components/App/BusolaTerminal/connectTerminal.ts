import { Terminal } from '@xterm/xterm';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { TerminalSessionState } from 'state/terminalSessionAtom';
import { CONTAINER_NAME, TERMINAL_NAMESPACE } from './provisionPod';
import { encodeBase64Url } from 'shared/utils/base64url';
import { TFunction } from 'i18next';

// Kubernetes attach stream channels — the first byte of every frame.
const STDIN_CHANNEL = 0;
const STDOUT_CHANNEL = 1;
const STDERR_CHANNEL = 2;
const RESIZE_CHANNEL = 4;

const ANSI_RESET = '\x1b[0m';
export const COLOR_SUCCESS = '\x1b[32m';
export const COLOR_WARNING = '\x1b[33m';
export const COLOR_ERROR = '\x1b[31m';

// \r returns the cursor to column 0 — xterm is in raw mode, so a lone \n staircases.
export const LINE_BREAK = '\r\n';

export function terminalMessage(color: string, text: string) {
  return `${LINE_BREAK}${color}${text}${ANSI_RESET}${LINE_BREAK}`;
}

export function sendResize(ws: WebSocket, cols: number, rows: number): void {
  if (ws.readyState !== WebSocket.OPEN) return;
  const message = JSON.stringify({ Width: cols, Height: rows });
  const bytes = new TextEncoder().encode(message);
  const frame = new Uint8Array(bytes.length + 1);
  frame[0] = RESIZE_CHANNEL;
  frame.set(bytes, 1);
  ws.send(frame);
}

function buildProtocols(authHeaders: Headers): string[] {
  return [
    'v4.channel.k8s.io',
    ...authHeaders.entries().map(([key, value]) => {
      return `base64url.header.${key.toLowerCase()}.value.${encodeBase64Url(value)}`;
    }),
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

// Auth encoded into Sec-WebSocket-Protocol — browser WebSocket has no headers param; #4920 decodes.
export async function connectTerminal({
  authHeaders,
  term,
  podName,
  setSession,
  signal,
  t,
  scheduleReconnect,
  onConnected,
}: {
  authHeaders: Headers;
  term: Terminal;
  podName: string;
  setSession: (
    update: (prev: TerminalSessionState) => TerminalSessionState,
  ) => void;
  signal: AbortSignal;
  t: TFunction;
  scheduleReconnect: (term: Terminal) => void;
  onConnected: () => void;
}): Promise<{ ws: WebSocket; disposable: { dispose: () => void } }> {
  const ws = new WebSocket(
    buildAttachUrl(podName),
    buildProtocols(authHeaders),
  );
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    if (signal.aborted) return;
    sendResize(ws, term.cols, term.rows);
    setSession((prev) => ({ ...prev, status: 'connected' }));
    term.write(
      terminalMessage(COLOR_SUCCESS, t('terminal.messages.connected')),
    );
    onConnected();
  };

  ws.onmessage = (event) => {
    const data = new Uint8Array(event.data as ArrayBuffer);
    if (data[0] === STDOUT_CHANNEL || data[0] === STDERR_CHANNEL) {
      term.write(data.slice(1));
    }
  };

  ws.onclose = (event) => {
    if (signal.aborted) return;
    const isUnexpectedDrop =
      event.code !== 1000 && event.code !== 1005 && !event.reason;
    if (isUnexpectedDrop) {
      term.write(
        terminalMessage(COLOR_WARNING, t('terminal.messages.connection-lost')),
      );
      setSession((prev) => ({ ...prev, status: 'reconnecting' }));
      scheduleReconnect(term);
    } else {
      setSession((prev) => ({ ...prev, status: 'idle' }));
      if (event.reason) {
        term.write(terminalMessage(COLOR_ERROR, event.reason));
      }
      term.write(terminalMessage(COLOR_WARNING, t('terminal.messages.closed')));
    }
  };

  ws.onerror = () => {
    if (signal.aborted) return;
    setSession((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: t('terminal.messages.connection-error'),
    }));
  };

  const dataDisposable = term.onData((input) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const bytes = new TextEncoder().encode(input);
    const frame = new Uint8Array(bytes.length + 1);
    frame[0] = STDIN_CHANNEL;
    frame.set(bytes, 1);
    ws.send(frame);
  });

  const resizeDisposable = term.onResize(({ cols, rows }) => {
    sendResize(ws, cols, rows);
  });

  return {
    ws,
    disposable: {
      dispose: () => {
        dataDisposable.dispose();
        resizeDisposable.dispose();
      },
    },
  };
}
