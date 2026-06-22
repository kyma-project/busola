import { beforeEach, describe, it, expect, vi } from 'vitest';

vi.mock('state/utils/getBackendInfo', () => ({
  getClusterConfig: () => ({ backendAddress: '/backend' }),
}));

import { getInsights } from './getInsights';

function makeSSEStream(tokens: string[]) {
  const lines =
    tokens.map((t) => `data: ${JSON.stringify({ token: t })}\n\n`).join('') +
    'event: done\ndata: {}\n\n';
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(lines));
      controller.close();
    },
  });
}

const baseParams = {
  resourceKind: 'Deployment',
  resourceName: 'my-app',
  resourceApiVersion: 'apps/v1',
  namespace: 'default',
  auth: {
    clusterUrl: 'https://cluster.example',
    certificateAuthorityData: 'ca-data',
    clusterToken: 'token-abc',
  },
  onToken: vi.fn(),
};

describe('getInsights', () => {
  beforeEach(() => {
    baseParams.onToken = vi.fn();
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: makeSSEStream(['looks ', 'healthy']),
    })) as unknown as typeof fetch;
  });

  it('posts to /backend/ai-editor/insights with SSE Accept header and mapped body + auth', async () => {
    await getInsights(baseParams);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe('/backend/ai-editor/insights');
    expect(opts.method).toBe('POST');
    expect(opts.headers['Accept']).toBe('text/event-stream');
    expect(JSON.parse(opts.body)).toEqual({
      resource_kind: 'Deployment',
      resource_name: 'my-app',
      resource_api_version: 'apps/v1',
      namespace: 'default',
      clusterUrl: 'https://cluster.example',
      certificateAuthorityData: 'ca-data',
      clusterToken: 'token-abc',
      clientCertificateData: undefined,
      clientKeyData: undefined,
    });
  });

  it('calls onToken for each SSE token in order', async () => {
    await getInsights(baseParams);

    expect(baseParams.onToken).toHaveBeenCalledTimes(2);
    expect(baseParams.onToken).toHaveBeenNthCalledWith(1, 'looks ');
    expect(baseParams.onToken).toHaveBeenNthCalledWith(2, 'healthy');
  });

  it('throws with the backend error message on a non-ok response', async () => {
    global.fetch = vi.fn(async () => ({
      ok: false,
      status: 503,
      json: async () => ({ error: 'AI insights is not configured' }),
    })) as unknown as typeof fetch;

    await expect(getInsights(baseParams)).rejects.toThrow(
      'AI insights is not configured',
    );
  });

  it('throws when the response body is null', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      body: null,
    })) as unknown as typeof fetch;

    await expect(getInsights(baseParams)).rejects.toThrow('empty response');
  });
});
