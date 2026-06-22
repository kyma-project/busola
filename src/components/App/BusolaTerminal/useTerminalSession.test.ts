import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { HttpError } from 'shared/hooks/BackendAPI/config';

// Sentinel atoms so useAtomValue/useSetAtom and useFetch can be stubbed for the
// useTerminalSession hook tests. provisionPod/attachToPod take fetchFn directly.
vi.mock('state/authDataAtom', () => ({ authDataAtom: { id: 'auth' } }));
vi.mock('state/clusterAtom', () => ({ clusterAtom: { id: 'cluster' } }));
vi.mock('state/terminalSessionAtom', () => ({
  terminalSessionAtom: { id: 'session' },
}));

let mockAuthData: any;
let mockCluster: any;
const setSession = vi.fn();

vi.mock('jotai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('jotai')>()),
  useAtomValue: (a: any) =>
    a?.id === 'auth'
      ? mockAuthData
      : a?.id === 'cluster'
        ? mockCluster
        : undefined,
  useSetAtom: () => setSession,
}));

const hookFetch = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => hookFetch,
}));

import {
  generateTerminalPodName,
  provisionPod,
  connectTerminal,
  useTerminalSession,
} from './useTerminalSession';

const NS = 'busola-terminal';
const POD = 'busola-terminal-aabbccdd';

const jsonResponse = (data: any) => ({ json: () => Promise.resolve(data) });

// Returns the latest setSession arg, whether it's an updater fn or a value.
const applyLast = (fn: any) => {
  const arg = fn.mock.calls.at(-1)?.[0];
  return typeof arg === 'function' ? arg({}) : arg;
};

function makeTerm() {
  return {
    write: vi.fn(),
    onData: vi.fn((_handler: (data: string) => void) => ({ dispose: vi.fn() })),
  };
}

// Capture sockets opened internally so tests can drive their callbacks.
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

beforeEach(() => {
  mockAuthData = { token: 'tok123' };
  mockCluster = {
    currentContext: {
      cluster: { cluster: { server: 'https://cluster.example.com' } },
    },
  };
  wsInstances.length = 0;
  hookFetch.mockReset();
  setSession.mockReset();
  vi.stubGlobal('WebSocket', MockWebSocket as any);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('generateTerminalPodName', () => {
  it('produces the expected prefix', async () => {
    const name = await generateTerminalPodName('https://example.com', 'tok123');
    expect(name).toMatch(/^busola-terminal-[0-9a-f]{8}$/);
  });

  it('is deterministic for the same inputs', async () => {
    const a = await generateTerminalPodName('https://cluster.example.com', 'a');
    const b = await generateTerminalPodName('https://cluster.example.com', 'a');
    expect(a).toBe(b);
  });

  it('differs for different cluster servers', async () => {
    const a = await generateTerminalPodName(
      'https://cluster-a.example.com',
      't',
    );
    const b = await generateTerminalPodName(
      'https://cluster-b.example.com',
      't',
    );
    expect(a).not.toBe(b);
  });

  it('differs for different credentials', async () => {
    const a = await generateTerminalPodName('https://cluster.example.com', 'A');
    const b = await generateTerminalPodName('https://cluster.example.com', 'B');
    expect(a).not.toBe(b);
  });
});

describe('provisionPod', () => {
  const signal = new AbortController().signal;

  function podFetch(phase = 'Running') {
    return vi.fn(({ relativeUrl, init }: any) => {
      const method = init?.method ?? 'GET';
      if (method === 'GET' && relativeUrl.includes('/pods/'))
        return Promise.resolve(jsonResponse({ status: { phase } }));
      return Promise.resolve(jsonResponse({}));
    });
  }

  it('creates the namespace and pod, then resolves once Running', async () => {
    const fetchFn = podFetch('Running');
    await provisionPod({
      fetchFn: fetchFn as any,
      podName: POD,
      image: 'i',
      signal,
    });

    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: '/api/v1/namespaces',
        init: expect.objectContaining({ method: 'POST' }),
      }),
    );
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: `/api/v1/namespaces/${NS}/pods`,
        init: expect.objectContaining({ method: 'POST' }),
      }),
    );
  });

  it('puts the configured image into the pod manifest', async () => {
    const fetchFn = podFetch('Running');
    await provisionPod({
      fetchFn: fetchFn as any,
      podName: POD,
      image: 'my-registry/dev:1.2.3',
      signal,
    });
    const podCall = fetchFn.mock.calls.find(([arg]: any) =>
      arg.relativeUrl.endsWith('/pods'),
    );
    expect(podCall?.[0].init.body).toContain('my-registry/dev:1.2.3');
  });

  it('tolerates a 409 when the namespace or pod already exists', async () => {
    const conflict = new HttpError('Conflict', 409, 409);
    const fetchFn = vi.fn(({ init }: any) => {
      if ((init?.method ?? 'GET') === 'POST') return Promise.reject(conflict);
      return Promise.resolve(jsonResponse({ status: { phase: 'Running' } }));
    });
    await expect(
      provisionPod({
        fetchFn: fetchFn as any,
        podName: POD,
        image: 'i',
        signal,
      }),
    ).resolves.toBeUndefined();
  });

  it('rethrows non-409 errors', async () => {
    const boom = new HttpError('Boom', 500, 500);
    const fetchFn = vi.fn(() => Promise.reject(boom));
    await expect(
      provisionPod({
        fetchFn: fetchFn as any,
        podName: POD,
        image: 'i',
        signal,
      }),
    ).rejects.toBe(boom);
  });

  it('throws when the pod enters a terminal phase', async () => {
    const fetchFn = podFetch('Failed');
    await expect(
      provisionPod({
        fetchFn: fetchFn as any,
        podName: POD,
        image: 'i',
        signal,
      }),
    ).rejects.toThrow(/Failed/);
  });
});

describe('connectTerminal', () => {
  const tokenFetch = () =>
    vi.fn(() => Promise.resolve(jsonResponse({ token: 'wstok' })));

  async function attach(signal = new AbortController().signal) {
    const fetchFn = tokenFetch();
    const term = makeTerm();
    const sess = vi.fn();
    const { ws, disposable } = await connectTerminal({
      fetchFn: fetchFn as any,
      term: term as any,
      podName: POD,
      setSession: sess,
      signal,
    });
    return { fetchFn, term, sess, ws: ws as any, disposable };
  }

  it('requests a ws-token and opens the attach socket', async () => {
    const { fetchFn, ws } = await attach();
    expect(fetchFn).toHaveBeenCalledWith(
      expect.objectContaining({
        relativeUrl: '/ws-token',
        init: expect.objectContaining({ method: 'POST' }),
      }),
    );
    expect(ws.url).toContain(
      `/backend/ws/api/v1/namespaces/${NS}/pods/${POD}/attach?`,
    );
    expect(ws.url).toContain('wsToken=wstok');
    expect(ws.protocols).toEqual(['v4.channel.k8s.io']);
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

  it('ignores socket callbacks once the signal is aborted', async () => {
    const ac = new AbortController();
    const { ws, sess } = await attach(ac.signal);
    ac.abort();
    ws.onopen();
    expect(sess).not.toHaveBeenCalled();
  });
});

describe('useTerminalSession', () => {
  function setupHappyHookFetch() {
    hookFetch.mockImplementation(({ relativeUrl, init }: any) => {
      const method = init?.method ?? 'GET';
      if (relativeUrl === '/ws-token')
        return Promise.resolve(jsonResponse({ token: 'wstok' }));
      if (method === 'GET' && relativeUrl.includes('/pods/'))
        return Promise.resolve(jsonResponse({ status: { phase: 'Running' } }));
      return Promise.resolve(jsonResponse({}));
    });
  }

  it('connect provisions the pod and opens the attach socket', async () => {
    setupHappyHookFetch();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });

    expect(lastWs()?.url).toContain('/attach?');
    expect(lastWs()?.protocols).toEqual(['v4.channel.k8s.io']);
  });

  it('disconnect closes the socket, deletes the pod and resets the session', async () => {
    setupHappyHookFetch();
    const { result } = renderHook(() => useTerminalSession());
    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });
    const ws = lastWs()!;
    hookFetch.mockClear();

    await act(async () => {
      await result.current.disconnect(POD);
    });

    expect(ws.readyState).toBe(MockWebSocket.CLOSED);
    expect(hookFetch).toHaveBeenCalledWith({
      relativeUrl: `/api/v1/namespaces/${NS}/pods/${POD}`,
      init: { method: 'DELETE' },
    });
    expect(setSession).toHaveBeenLastCalledWith({
      status: 'idle',
      podName: null,
      errorMessage: null,
    });
  });

  it('disconnect is a no-op without a pod name', async () => {
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.disconnect(null);
    });

    expect(hookFetch).not.toHaveBeenCalled();
  });
});
