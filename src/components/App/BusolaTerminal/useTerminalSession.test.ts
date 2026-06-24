import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';

vi.mock('state/authDataAtom', () => ({ authDataAtom: { id: 'auth' } }));
vi.mock('state/clusterAtom', () => ({ clusterAtom: { id: 'cluster' } }));
vi.mock('state/ssoDataAtom', () => ({ ssoDataAtom: { id: 'sso' } }));
vi.mock('state/terminalSessionAtom', () => ({
  terminalSessionAtom: { id: 'session' },
}));

let mockAuthData: any;
let mockCluster: any;
const setSession = vi.fn();

vi.mock('jotai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('jotai')>()),
  useAtomValue: (a: any) => {
    if (a?.id === 'auth') return mockAuthData;
    if (a?.id === 'cluster') return mockCluster;
    if (a?.id === 'sso') return null;
    return undefined;
  },
  useSetAtom: () => setSession,
}));

const hookFetch = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => hookFetch,
}));

const MOCK_AUTH_HEADERS = {
  'X-Cluster-Url': 'https://cluster.example.com',
  'X-K8s-Authorization': 'Bearer tok123',
};
vi.mock('shared/hooks/BackendAPI/createHeaders', () => ({
  createHeaders: () => MOCK_AUTH_HEADERS,
}));

import { useTerminalSession } from './useTerminalSession';

const NS = 'busola-terminal';
const POD = 'busola-terminal-aabbccdd';

const jsonResponse = (data: any) => ({ json: () => Promise.resolve(data) });

function makeTerm() {
  return {
    write: vi.fn(),
    onData: vi.fn((_handler: (data: string) => void) => ({ dispose: vi.fn() })),
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

describe('useTerminalSession', () => {
  function setupHappyHookFetch() {
    hookFetch.mockImplementation(({ relativeUrl, init }: any) => {
      const method = init?.method ?? 'GET';
      if (method === 'GET' && relativeUrl.includes('/pods/'))
        return Promise.resolve(jsonResponse({ status: { phase: 'Running' } }));
      return Promise.resolve(jsonResponse({}));
    });
  }

  it('connect provisions the pod and opens the attach socket with auth in protocols', async () => {
    setupHappyHookFetch();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });

    expect(lastWs()?.url).toContain('/attach?');
    expect(lastWs()?.protocols).toContain('v4.channel.k8s.io');
    expect(lastWs()?.protocols).toContain(
      `base64url.header.x-k8s-authorization.${btoa('Bearer tok123').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')}`,
    );
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

  it('deletes the pod only once when disconnect is called repeatedly', async () => {
    setupHappyHookFetch();
    const { result } = renderHook(() => useTerminalSession());
    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });
    hookFetch.mockClear();

    await act(async () => {
      await result.current.disconnect(POD);
      await result.current.disconnect(POD);
    });

    const deleteCalls = hookFetch.mock.calls.filter(
      ([arg]: any) => arg.init?.method === 'DELETE',
    );
    expect(deleteCalls).toHaveLength(1);
  });

  it('disconnect is a no-op without a pod name', async () => {
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.disconnect(null);
    });

    expect(hookFetch).not.toHaveBeenCalled();
  });
});
