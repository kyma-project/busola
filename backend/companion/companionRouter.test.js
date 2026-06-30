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

  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./companionRouter.js');
    handleClusterRegion = mod.handleClusterRegion;
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
});
