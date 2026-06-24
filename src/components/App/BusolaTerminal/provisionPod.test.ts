import { describe, it, expect, vi } from 'vitest';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { generateTerminalPodName, provisionPod } from './provisionPod';

const NS = 'busola-terminal';
const POD = 'busola-terminal-aabbccdd';

const jsonResponse = (data: any) => ({ json: () => Promise.resolve(data) });

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
  const abortController = new AbortController();

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
      abortController,
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

  it('forwards the abort controller to every request so teardown can cancel them', async () => {
    const fetchFn = podFetch('Running');
    await provisionPod({
      fetchFn: fetchFn as any,
      podName: POD,
      image: 'i',
      abortController,
    });

    expect(fetchFn).toHaveBeenCalled();
    for (const [arg] of fetchFn.mock.calls) {
      expect(arg.abortController).toBe(abortController);
    }
  });

  it('stops polling once the controller is aborted', async () => {
    const fetchFn = podFetch('Pending');
    const aborted = new AbortController();
    aborted.abort();
    await expect(
      provisionPod({
        fetchFn: fetchFn as any,
        podName: POD,
        image: 'i',
        abortController: aborted,
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('puts the configured image into the pod manifest', async () => {
    const fetchFn = podFetch('Running');
    await provisionPod({
      fetchFn: fetchFn as any,
      podName: POD,
      image: 'my-registry/dev:1.2.3',
      abortController,
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
        abortController,
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
        abortController,
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
        abortController,
      }),
    ).rejects.toThrow(/Failed/);
  });
});
