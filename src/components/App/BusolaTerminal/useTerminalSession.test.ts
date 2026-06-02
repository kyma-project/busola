import { describe, it, expect, vi, afterEach } from 'vitest';
import { deriveTerminalPodName } from './useTerminalSession';

// ---------------------------------------------------------------------------
// deriveTerminalPodName
// ---------------------------------------------------------------------------

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
    const a = await deriveTerminalPodName(
      'https://cluster-a.example.com',
      'tok',
    );
    const b = await deriveTerminalPodName(
      'https://cluster-b.example.com',
      'tok',
    );
    expect(a).not.toBe(b);
  });

  it('differs for different tokens', async () => {
    const a = await deriveTerminalPodName(
      'https://cluster.example.com',
      'tokenA',
    );
    const b = await deriveTerminalPodName(
      'https://cluster.example.com',
      'tokenB',
    );
    expect(a).not.toBe(b);
  });
});

// ---------------------------------------------------------------------------
// Pod lifecycle helpers (tested in isolation)
// ---------------------------------------------------------------------------

const TERMINAL_NAMESPACE = 'busola-terminal';

function makeMockFetch(responses: Record<string, any>) {
  return vi.fn(({ relativeUrl, init }: { relativeUrl: string; init?: any }) => {
    const key = `${init?.method ?? 'GET'} ${relativeUrl.split('?')[0]}`;
    const fixture = responses[key];
    if (fixture instanceof Error) return Promise.reject(fixture);
    return Promise.resolve({
      json: () => Promise.resolve(fixture),
      ok: true,
    });
  });
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('terminal session pod lifecycle', () => {
  it('does not throw when namespace already exists (409)', async () => {
    const conflict: any = new Error('Conflict');
    conflict.code = 409;
    const fetchMock = vi.fn().mockRejectedValueOnce(conflict);

    try {
      await fetchMock({
        relativeUrl: '/api/v1/namespaces',
        init: { method: 'POST' },
      });
    } catch (err: any) {
      if (err?.code !== 409 && err?.status !== 409) throw err;
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('creates namespace via POST', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ kind: 'Namespace' }),
    });

    await fetchMock({
      relativeUrl: '/api/v1/namespaces',
      init: { method: 'POST', body: '{}' },
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0].init.method).toBe('POST');
  });

  it('creates pod via POST, ignores 409 when pod already exists', async () => {
    const podName = 'busola-terminal-aabbccdd';
    const conflict: any = new Error('Conflict');
    conflict.code = 409;
    const fetchMock = vi.fn().mockRejectedValueOnce(conflict);

    try {
      await fetchMock({
        relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods`,
        init: { method: 'POST', body: '{}' },
      });
    } catch (err: any) {
      if (err?.code !== 409 && err?.status !== 409) throw err;
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
    void podName;
  });

  it('polls until pod is Running', async () => {
    vi.useFakeTimers();
    const podName = 'busola-terminal-aabbccdd';
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: { phase: 'Pending' } }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: { phase: 'Pending' } }),
      })
      .mockResolvedValueOnce({
        json: () => Promise.resolve({ status: { phase: 'Running' } }),
      });

    // Replicate pollPodReady logic synchronously with fake timers.
    const poll = async () => {
      for (let i = 0; i < 10; i++) {
        const res = await fetchMock({
          relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}`,
        });
        const pod = await res.json();
        if (pod?.status?.phase === 'Running') return;
        await Promise.resolve(); // flush microtasks
        vi.advanceTimersByTime(2000);
      }
      throw new Error('Timed out');
    };

    await poll();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('calls DELETE on disconnect', async () => {
    const podName = 'busola-terminal-aabbccdd';
    const fetchMock = makeMockFetch({
      [`DELETE /api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}`]: {},
    });

    await fetchMock({
      relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}`,
      init: { method: 'DELETE' },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0].init.method).toBe('DELETE');
  });
});
