import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('./TokenManager.js', () => ({
  TokenManager: vi.fn().mockImplementation(function () {
    this.getToken = vi.fn().mockResolvedValue('mock-token');
  }),
}));

vi.mock('../src/config/config.js', () => ({
  default: {
    features: {
      KYMA_COMPANION: {
        config: {
          apiBaseUrl: 'https://companion.example.com',
          skipAuth: false,
        },
      },
    },
  },
}));

vi.mock('lodash.escape', () => ({ default: (s) => s }));

function makeMockRes() {
  const res = {
    _status: null,
    _body: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

function makeMockReq(shootId) {
  return {
    params: { shootId },
    log: { warn: vi.fn() },
    id: 'req-1234',
  };
}

describe('handleClusterRegion', () => {
  let handleClusterRegion;
  let CLUSTER_REGION_CACHE_MAX;

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./companionRouter.js');
    handleClusterRegion = mod.handleClusterRegion;
    CLUSTER_REGION_CACHE_MAX = mod.CLUSTER_REGION_CACHE_MAX;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns 400 for a shoot ID with spaces', async () => {
    const req = makeMockReq('invalid shoot id');
    const res = makeMockRes();
    await handleClusterRegion(req, res);
    expect(res._status).toBe(400);
    expect(res._body.error).toMatch(/Invalid shoot ID format/);
  });

  it('returns 400 for a shoot ID that is too long', async () => {
    const req = makeMockReq('a'.repeat(64));
    const res = makeMockRes();
    await handleClusterRegion(req, res);
    expect(res._status).toBe(400);
  });

  it('returns 400 for a shoot ID with injection characters', async () => {
    const req = makeMockReq('c-abc,label=x');
    const res = makeMockRes();
    await handleClusterRegion(req, res);
    expect(res._status).toBe(400);
  });

  it('proxies a 200 response from kyma-companion', async () => {
    const mockData = {
      'shoot-id': 'c-abc123',
      region: 'eu-west-1',
      platformRegion: 'cf-eu11',
      provider: 'aws',
      isEUAccessOnly: false,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 200, json: async () => mockData }),
    );

    const req = makeMockReq('c-abc123');
    const res = makeMockRes();
    await handleClusterRegion(req, res);

    expect(res._status).toBe(200);
    expect(res._body.isEUAccessOnly).toBe(false);
  });

  it('forwards 404 from kyma-companion', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        status: 404,
        json: async () => ({ error: 'Not Found' }),
      }),
    );

    const req = makeMockReq('c-nonexistent');
    const res = makeMockRes();
    await handleClusterRegion(req, res);

    expect(res._status).toBe(404);
  });

  it('returns 500 when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));

    const req = makeMockReq('c-abc123');
    const res = makeMockRes();
    await handleClusterRegion(req, res);

    expect(res._status).toBe(500);
    expect(res._body.error).toMatch(/Failed to fetch cluster region data/);
  });

  it('calls the companion API with the Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = makeMockReq('c-abc123');
    const res = makeMockRes();
    await handleClusterRegion(req, res);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/tools/cluster-region/c-abc123');
    expect(opts.headers.Authorization).toBe('Bearer mock-token');
  });

  it('returns cached response on second request without hitting the companion API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const req = makeMockReq('c-cached');
    await handleClusterRegion(req, makeMockRes());
    expect(fetchMock).toHaveBeenCalledOnce();

    const res2 = makeMockRes();
    await handleClusterRegion(makeMockReq('c-cached'), res2);
    expect(fetchMock).toHaveBeenCalledOnce(); // still only once
    expect(res2._status).toBe(200);
    expect(res2._body.isEUAccessOnly).toBe(false);
  });

  it('does not cache error responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'upstream failure' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ isEUAccessOnly: false }),
      });
    vi.stubGlobal('fetch', fetchMock);

    await handleClusterRegion(makeMockReq('c-err'), makeMockRes());
    const res2 = makeMockRes();
    await handleClusterRegion(makeMockReq('c-err'), res2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res2._status).toBe(200);
  });

  it('evicts the oldest entry when the cache reaches its limit', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    for (let i = 0; i < CLUSTER_REGION_CACHE_MAX; i++) {
      await handleClusterRegion(makeMockReq(`c-fill${i}`), makeMockRes());
    }
    expect(fetchMock).toHaveBeenCalledTimes(CLUSTER_REGION_CACHE_MAX);

    await handleClusterRegion(makeMockReq('c-new'), makeMockRes());
    expect(fetchMock).toHaveBeenCalledTimes(CLUSTER_REGION_CACHE_MAX + 1);

    await handleClusterRegion(makeMockReq('c-fill0'), makeMockRes());
    expect(fetchMock).toHaveBeenCalledTimes(CLUSTER_REGION_CACHE_MAX + 2);

    await handleClusterRegion(makeMockReq('c-fill2'), makeMockRes());
    expect(fetchMock).toHaveBeenCalledTimes(CLUSTER_REGION_CACHE_MAX + 2);
  });
});
