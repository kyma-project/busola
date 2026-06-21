import { beforeEach, describe, it, expect, vi } from 'vitest';

vi.mock('state/utils/getBackendInfo', () => ({
  getClusterConfig: () => ({ backendAddress: '/backend' }),
}));

import { getInsights } from './getInsights';

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
};

describe('getInsights', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ insights: 'looks healthy' }),
    })) as unknown as typeof fetch;
  });

  it('posts to /backend/ai-editor/insights with the mapped body + auth', async () => {
    const result = await getInsights(baseParams);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls[0];
    expect(url).toBe('/backend/ai-editor/insights');
    expect(opts.method).toBe('POST');
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
    expect(result).toBe('looks healthy');
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

  it('throws when the response is missing insights', async () => {
    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({}),
    })) as unknown as typeof fetch;

    await expect(getInsights(baseParams)).rejects.toThrow(
      'unexpected response',
    );
  });
});
