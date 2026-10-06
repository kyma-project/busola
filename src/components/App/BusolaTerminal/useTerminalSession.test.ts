import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTerminalSession } from './useTerminalSession';
import { encodeBase64Url } from 'shared/utils/base64url';

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

let mockTerminalFeature: any;
vi.mock('hooks/useFeature', () => ({
  useFeature: () => mockTerminalFeature,
}));

vi.mock('./provisionPod', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./provisionPod')>()),
  generateTerminalPodName: vi
    .fn()
    .mockResolvedValue('busola-terminal-aabbccdd'),
}));

const NS = 'busola-terminal';
const POD = 'busola-terminal-aabbccdd';

const jsonResponse = (data: any) => ({ json: () => Promise.resolve(data) });

function makeTerm() {
  return {
    write: vi.fn(),
    cols: 80,
    rows: 24,
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
const lastWs = () => wsInstances.at(-1);

beforeEach(() => {
  mockAuthData = { token: 'tok123' };
  mockCluster = {
    currentContext: {
      cluster: { cluster: { server: 'https://cluster.example.com' } },
    },
  };
  // Proactive reconnect off by default; individual tests opt in.
  mockTerminalFeature = { isEnabled: true, config: {} };
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
      `base64url.header.x-k8s-authorization.value.${encodeBase64Url('Bearer tok123')}`,
    );
  });

  it('connect resets session state (including podName) before provisioning', async () => {
    setupHappyHookFetch();
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });

    expect(setSession).toHaveBeenCalledWith({
      status: 'provisioning',
      podName: null,
      errorMessage: null,
    });
  });

  it('disconnect closes the socket and deletes the pod', async () => {
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

  it('disconnect does not reset session state, preventing a concurrent connect from being overwritten', async () => {
    setupHappyHookFetch();
    const { result } = renderHook(() => useTerminalSession());
    await act(async () => {
      await result.current.connect(makeTerm() as any);
    });
    setSession.mockClear();

    await act(async () => {
      await result.current.disconnect(POD);
    });

    expect(setSession).not.toHaveBeenCalled();
  });

  it('disconnect is a no-op without a pod name', async () => {
    const { result } = renderHook(() => useTerminalSession());

    await act(async () => {
      await result.current.disconnect(null);
    });

    expect(hookFetch).not.toHaveBeenCalled();
  });

  it('cancels a pending reconnect on disconnect so it cannot revive a torn-down terminal', async () => {
    vi.useFakeTimers();
    try {
      setupHappyHookFetch();
      const { result } = renderHook(() => useTerminalSession());

      await act(async () => {
        await result.current.connect(makeTerm() as any);
      });

      // an unexpected drop (1006) schedules a reconnect
      act(() => {
        lastWs()!.onclose?.({ code: 1006 } as any);
      });
      expect(wsInstances).toHaveLength(1);

      await act(async () => {
        await result.current.disconnect(POD);
      });

      // past the backoff + jitter (<= ~2s)
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000);
      });

      // cancelled: no second socket opened
      expect(wsInstances).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  // Proactive reconnect fires 30s (the buffer) before the cap.
  const CAP_MS = 900_000;
  const PROACTIVE_DELAY_MS = CAP_MS - 30_000; // 870s

  it('proactively reconnects before the hard cap without the connection-lost banner', async () => {
    vi.useFakeTimers();
    try {
      mockTerminalFeature = {
        isEnabled: true,
        config: { maxSessionDurationMs: CAP_MS },
      };
      setupHappyHookFetch();
      const term = makeTerm();
      const { result } = renderHook(() => useTerminalSession());

      await act(async () => {
        await result.current.connect(term as any);
      });
      // onopen arms the proactive timer
      act(() => {
        lastWs()!.onopen?.();
      });
      expect(wsInstances).toHaveLength(1);

      setSession.mockClear();
      term.write.mockClear();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(PROACTIVE_DELAY_MS);
      });

      expect(wsInstances).toHaveLength(2);
      // silent: no provisioning flash, no output
      expect(setSession).not.toHaveBeenCalledWith({
        status: 'provisioning',
        podName: null,
        errorMessage: null,
      });
      expect(term.write).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not proactively reconnect when maxSessionDurationMs is unset', async () => {
    vi.useFakeTimers();
    try {
      mockTerminalFeature = { isEnabled: true, config: {} };
      setupHappyHookFetch();
      const { result } = renderHook(() => useTerminalSession());

      await act(async () => {
        await result.current.connect(makeTerm() as any);
      });
      act(() => {
        lastWs()!.onopen?.();
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3_600_000); // one hour
      });

      expect(wsInstances).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels the pending proactive reconnect on disconnect', async () => {
    vi.useFakeTimers();
    try {
      mockTerminalFeature = {
        isEnabled: true,
        config: { maxSessionDurationMs: CAP_MS },
      };
      setupHappyHookFetch();
      const { result } = renderHook(() => useTerminalSession());

      await act(async () => {
        await result.current.connect(makeTerm() as any);
      });
      act(() => {
        lastWs()!.onopen?.();
      });

      await act(async () => {
        await result.current.disconnect(POD);
      });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(CAP_MS);
      });

      expect(wsInstances).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('a genuine drop still uses the reactive reconnect and cancels the proactive timer', async () => {
    vi.useFakeTimers();
    try {
      mockTerminalFeature = {
        isEnabled: true,
        config: { maxSessionDurationMs: CAP_MS },
      };
      setupHappyHookFetch();
      const term = makeTerm();
      const { result } = renderHook(() => useTerminalSession());

      await act(async () => {
        await result.current.connect(term as any);
      });
      act(() => {
        lastWs()!.onopen?.(); // arms proactive timer
      });
      term.write.mockClear();

      // unexpected drop before the proactive timer fires
      act(() => {
        lastWs()!.onclose?.({ code: 1006 } as any);
      });
      // reactive path announces the loss (not silent)
      expect(term.write).toHaveBeenCalled();

      // past the reactive backoff → socket #2
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_500);
      });
      expect(wsInstances).toHaveLength(2);

      // the drop cancelled the old proactive timer and the reactive socket
      // never opened, so nothing re-armed it
      await act(async () => {
        await vi.advanceTimersByTimeAsync(CAP_MS);
      });
      expect(wsInstances).toHaveLength(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('re-arms the proactive timer after a reactive reconnect completes', async () => {
    vi.useFakeTimers();
    try {
      mockTerminalFeature = {
        isEnabled: true,
        config: { maxSessionDurationMs: CAP_MS },
      };
      setupHappyHookFetch();
      const term = makeTerm();
      const { result } = renderHook(() => useTerminalSession());

      await act(async () => {
        await result.current.connect(term as any);
      });
      act(() => {
        lastWs()!.onopen?.();
      });

      // drop → reactive reconnect opens socket #2
      act(() => {
        lastWs()!.onclose?.({ code: 1006 } as any);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(2_500);
      });
      expect(wsInstances).toHaveLength(2);

      // socket #2 opens → re-arms the proactive timer
      act(() => {
        lastWs()!.onopen?.();
      });
      term.write.mockClear();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(PROACTIVE_DELAY_MS);
      });

      // proactive reconnect fires from the re-armed timer, silently
      expect(wsInstances).toHaveLength(3);
      expect(term.write).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
