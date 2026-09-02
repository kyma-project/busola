import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { connectTerminal } from './connectTerminal';
import { encodeBase64Url } from 'shared/utils/base64url';
import { TFunction } from 'i18next';

const NS = 'busola-terminal';
const POD = 'busola-terminal-aabbccdd';

const AUTH_HEADERS = new Headers({
  'X-Cluster-Url': 'https://cluster.example.com',
  'X-K8s-Authorization': 'Bearer tok123',
});

function makeTerm(cols = 80, rows = 24) {
  return {
    write: vi.fn(),
    cols,
    rows,
    onData: vi.fn((_handler: (data: string) => void) => ({ dispose: vi.fn() })),
    onResize: vi.fn(
      (_handler: (size: { cols: number; rows: number }) => void) => ({
        dispose: vi.fn(),
      }),
    ),
  };
}

class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  url: string;
  protocols: any;
  readyState = MockWebSocket.OPEN;
  binaryType = '';
  onopen: ((e?: any) => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  onclose: ((e?: any) => void) | null = null;
  onerror: ((e?: any) => void) | null = null;
  sent: any[] = [];
  constructor(url: string, protocols?: any) {
    this.url = url;
    this.protocols = protocols;
    wsInstances.push(this);
  }
  send(data: any) {
    this.sent.push(data);
  }
  close() {
    this.readyState = MockWebSocket.CLOSED;
  }
}
const wsInstances: MockWebSocket[] = [];

beforeEach(() => {
  wsInstances.length = 0;
  vi.stubGlobal('WebSocket', MockWebSocket as any);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const applyLast = (fn: any) => {
  const arg = fn.mock.calls.at(-1)?.[0];
  return typeof arg === 'function' ? arg({}) : arg;
};

const DEFAULT_T = ((key: string) => key) as TFunction;

async function attach(signal = new AbortController().signal, t = DEFAULT_T) {
  const term = makeTerm();
  const sess = vi.fn();
  const { ws, disposable } = await connectTerminal({
    authHeaders: AUTH_HEADERS,
    term: term as any,
    podName: POD,
    setSession: sess,
    signal,
    t,
    scheduleReconnect: vi.fn(),
    onConnected: vi.fn(),
  });
  return { term, sess, ws: ws as any, disposable };
}

describe('connectTerminal', () => {
  it('opens the attach socket with auth encoded in protocols', async () => {
    const { ws } = await attach();
    expect(ws.url).toContain(
      `/backend/ws/api/v1/namespaces/${NS}/pods/${POD}/attach?`,
    );
    expect(ws.protocols).toContain('v4.channel.k8s.io');
    expect(ws.protocols).toContain(
      `base64url.header.x-cluster-url.value.${encodeBase64Url('https://cluster.example.com')}`,
    );
    expect(ws.protocols).toContain(
      `base64url.header.x-k8s-authorization.value.${encodeBase64Url('Bearer tok123')}`,
    );
  });

  it('sets connected on open and writes stdout (channel 1) frames', async () => {
    const { ws, term, sess } = await attach();
    ws.onopen();
    expect(applyLast(sess)).toMatchObject({ status: 'connected' });

    // channel 1 (stdout) + "hi"
    ws.onmessage({ data: new Uint8Array([1, 104, 105]).buffer });
    expect(term.write).toHaveBeenCalledWith(new Uint8Array([104, 105]));
  });

  it('frames terminal input onto the stdin channel (0)', async () => {
    const { ws, term } = await attach();
    const onData = term.onData.mock.calls[0][0];
    onData('x');

    expect(ws.sent).toHaveLength(1);
    const frame = ws.sent[0] as Uint8Array;
    expect(frame[0]).toBe(0);
    expect(Array.from(frame.slice(1))).toEqual(
      Array.from(new TextEncoder().encode('x')),
    );
  });

  it('sends a resize frame (channel 4) on open with current terminal dimensions', async () => {
    const { ws, term } = await attach();
    ws.onopen();

    const resizeFrame = ws.sent.find((f: Uint8Array) => f[0] === 4);
    expect(resizeFrame).toBeDefined();
    const payload = JSON.parse(new TextDecoder().decode(resizeFrame.slice(1)));
    expect(payload).toEqual({ Width: term.cols, Height: term.rows });
  });

  it('sends a resize frame (channel 4) when the terminal is resized', async () => {
    const { ws, term } = await attach();
    ws.onopen();
    ws.sent.length = 0; // clear the initial resize frame

    const resizeHandler = term.onResize.mock.calls[0][0];
    resizeHandler({ cols: 120, rows: 40 });

    const frame = ws.sent.find((f: Uint8Array) => f[0] === 4);
    expect(frame).toBeDefined();
    const payload = JSON.parse(new TextDecoder().decode(frame.slice(1)));
    expect(payload).toEqual({ Width: 120, Height: 40 });
  });

  it('ignores socket callbacks once the signal is aborted', async () => {
    const ac = new AbortController();
    const { ws, sess } = await attach(ac.signal);
    ac.abort();
    ws.onopen();
    expect(sess).not.toHaveBeenCalled();
  });

  it('writes the provided (translatable) status messages', async () => {
    const t = ((key: string) =>
      ({
        'terminal.messages.connected': 'translated-connected',
        'terminal.messages.closed': 'translated-closed',
        'terminal.messages.connection-error': 'translated-error',
      })[key] ?? key) as TFunction;
    const expectedReason = 'Closing because I can';

    const { ws, term } = await attach(new AbortController().signal, t);

    ws.onopen();
    expect(term.write).toHaveBeenCalledWith(
      expect.stringContaining('translated-connected'),
    );

    ws.onclose({ reason: expectedReason, code: 1000 });
    expect(term.write).toHaveBeenCalledWith(
      expect.stringContaining(expectedReason),
    );

    expect(term.write).toHaveBeenCalledWith(
      expect.stringContaining('translated-closed'),
    );
  });
});
