import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

// Sentinel atoms so useAtomValue/useSetAtom and useFetch can be stubbed.
vi.mock('state/authDataAtom', () => ({ authDataAtom: { id: 'auth' } }));
vi.mock('state/clusterAtom', () => ({ clusterAtom: { id: 'cluster' } }));
vi.mock('state/terminalSessionAtom', () => ({
  terminalSessionAtom: { id: 'session' },
}));

let mockAuthData: any;
let mockCluster: any;
const setSession = vi.fn();

vi.mock('jotai', () => ({
  useAtomValue: (a: any) =>
    a?.id === 'auth'
      ? mockAuthData
      : a?.id === 'cluster'
        ? mockCluster
        : undefined,
  useSetAtom: () => setSession,
}));

const fetchFn = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => fetchFn,
}));

import {
  deriveTerminalPodName,
  useTerminalSession,
} from './useTerminalSession';

const TERMINAL_NAMESPACE = 'busola-terminal';

describe('deriveTerminalPodName', () => {
  it('produces the expected prefix', async () => {
    const name = await deriveTerminalPodName('https://example.com', 'tok123');
    expect(name).toMatch(/^busola-terminal-[0-9a-f]{8}$/);
  });

  it('is deterministic for the same inputs', async () => {
    const a = await deriveTerminalPodName('https://cluster.example.com', 'abc');
    const b = await deriveTerminalPodName('https://cluster.example.com', 'abc');
    expect(a).toBe(b);
  });

  it('differs for different cluster servers', async () => {
    const a = await deriveTerminalPodName('https://cluster-a.example.com', 't');
    const b = await deriveTerminalPodName('https://cluster-b.example.com', 't');
    expect(a).not.toBe(b);
  });

  it('differs for different tokens', async () => {
    const a = await deriveTerminalPodName('https://cluster.example.com', 'A');
    const b = await deriveTerminalPodName('https://cluster.example.com', 'B');
    expect(a).not.toBe(b);
  });
});

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
const lastWs = () => wsInstances.at(-1);

function makeTerm() {
  return {
    write: vi.fn(),
    onData: vi.fn((_handler: (data: string) => void) => ({ dispose: vi.fn() })),
  };
}

const jsonResponse = (data: any) => ({
  ok: true,
  json: () => Promise.resolve(data),
});

// Default happy-path backend: every call succeeds and the pod is Running.
function setupHappyFetch(phase = 'Running') {
  fetchFn.mockImplementation(({ relativeUrl, init }: any) => {
    const method = init?.method ?? 'GET';
    if (relativeUrl === '/ws-token')
      return Promise.resolve(jsonResponse({ token: 'wstok' }));
    if (method === 'GET' && relativeUrl.includes('/pods/'))
      return Promise.resolve(jsonResponse({ status: { phase } }));
    return Promise.resolve(jsonResponse({}));
  });
}

// setSession receives either an updater fn (connect) or a value (disconnect).
function lastSessionState() {
  const arg = setSession.mock.calls.at(-1)?.[0];
  return typeof arg === 'function' ? arg({}) : arg;
}

beforeEach(() => {
  mockAuthData = { token: 'tok123' };
  mockCluster = {
    currentContext: {
      cluster: { cluster: { server: 'https://cluster.example.com' } },
    },
  };
  wsInstances.length = 0;
  fetchFn.mockReset();
  setSession.mockReset();
  vi.stubGlobal('WebSocket', MockWebSocket as any);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useTerminalSession.connect', () => {
  it('ensures the namespace + pod, polls readiness, then opens an attach socket', async () => {
    setupHappyFetch();
    const term = makeTerm();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(term as any);
    });

    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: '/api/v1/namespaces',
        init: expect.objectContaining({ method: 'POST' }),
      }),
    );
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods`,
        init: expect.objectContaining({ method: 'POST' }),
      }),
    );
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: '/ws-token',
        init: expect.objectContaining({ method: 'POST' }),
      }),
    );

    expect(lastWs()?.url).toContain(
      `/backend/ws/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/`,
    );
    expect(lastWs()?.url).toContain('/attach?');
    expect(lastWs()?.url).toContain('wsToken=wstok');
    expect(lastWs()?.protocols).toEqual(['v4.channel.k8s.io']);
  });

  it('ignores a 409 when the namespace or pod already exists', async () => {
    const conflict: any = new Error('Conflict');
    conflict.code = 409;
    fetchFn.mockImplementation(({ relativeUrl, init }: any) => {
      const method = init?.method ?? 'GET';
      if (method === 'POST' && relativeUrl === '/api/v1/namespaces')
        return Promise.reject(conflict);
      if (method === 'POST' && relativeUrl.endsWith('/pods'))
        return Promise.reject(conflict);
      if (relativeUrl === '/ws-token')
        return Promise.resolve(jsonResponse({ token: 'wstok' }));
      if (method === 'GET' && relativeUrl.includes('/pods/'))
        return Promise.resolve(jsonResponse({ status: { phase: 'Running' } }));
      return Promise.resolve(jsonResponse({}));
    });
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });

    expect(lastWs()).toBeTruthy();
  });

  it('surfaces an error (without opening a socket) when the pod enters a terminal phase', async () => {
    setupHappyFetch('Failed');
    const term = makeTerm();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(term as any);
    });

    expect(lastSessionState()).toMatchObject({ status: 'error' });
    expect(lastWs()).toBeUndefined();
  });

  it('marks the session connected and writes stdout (channel 1) frames to the terminal', async () => {
    setupHappyFetch();
    const term = makeTerm();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(term as any);
    });

    act(() => lastWs()?.onopen?.());
    expect(lastSessionState()).toMatchObject({ status: 'connected' });

    // channel 1 (stdout) + "hi"
    act(() =>
      lastWs()?.onmessage?.({ data: new Uint8Array([1, 104, 105]).buffer }),
    );
    expect(term.write).toHaveBeenCalledWith(new Uint8Array([104, 105]));
  });

  it('frames terminal input onto the stdin channel (0)', async () => {
    setupHappyFetch();
    const term = makeTerm();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(term as any);
    });

    const onData = term.onData.mock.calls[0][0];
    act(() => onData('x'));

    expect(lastWs()?.sent).toHaveLength(1);
    const frame = lastWs()!.sent[0] as Uint8Array;
    expect(frame[0]).toBe(0);
    expect(Array.from(frame.slice(1))).toEqual(
      Array.from(new TextEncoder().encode('x')),
    );
  });
});

describe('useTerminalSession.disconnect', () => {
  it('closes the socket, deletes the pod and resets the session', async () => {
    setupHappyFetch();
    const { result } = renderHook(() => useTerminalSession());
    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });
    const ws = lastWs()!;
    fetchFn.mockClear();

    await act(async () => {
      await result.current.disconnect('busola-terminal-aabbccdd');
    });

    expect(ws.readyState).toBe(MockWebSocket.CLOSED);
    expect(fetchFn).toHaveBeenCalledWith({
      relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/busola-terminal-aabbccdd`,
      init: { method: 'DELETE' },
    });
    expect(setSession).toHaveBeenLastCalledWith({
      status: 'idle',
      podName: null,
      errorMessage: null,
    });
  });

  it('does not call the backend when there is no pod to delete', async () => {
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.disconnect(null);
    });

    expect(fetchFn).not.toHaveBeenCalled();
  });
});
