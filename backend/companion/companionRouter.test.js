import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('./TokenManager.js', () => ({
  TokenManager: vi.fn().mockImplementation(function () {
    this.getToken = vi.fn().mockResolvedValue('mock-token');
  }),
}));

vi.mock('lodash.escape', () => ({ default: (s) => s }));

function mockConfig(
  companionConfig = {
    apiBaseUrl: 'https://companion.example.com',
    issuerUrl: 'https://kyma.accounts.ondemand.com',
    skipAuth: false,
  },
) {
  vi.doMock('../src/config/config.js', () => ({
    default: { features: { KYMA_COMPANION: { config: companionConfig } } },
  }));
}

const SKR_URL = 'https://api.c-abc123.kyma.example.com';
const KYMA_ISSUER = 'https://kyma.accounts.ondemand.com';

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

function makeMockReq(body = {}) {
  return {
    body: {
      clusterUrl: SKR_URL,
      clusterToken: 'tok',
      oidcIssuerUrl: KYMA_ISSUER,
      ...body,
    },
    log: { warn: vi.fn() },
    id: 'req-1234',
  };
}

function stubRegion({ ok = true, status = 200, data } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => data ?? { isEUAccessOnly: false },
    }),
  );
}

describe('handlePublicKey (Joule eligibility gate)', () => {
  let handlePublicKey;

  beforeEach(async () => {
    vi.resetModules();
    mockConfig();
    handlePublicKey = (await import('./companionRouter.js')).handlePublicKey;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // The handler makes two different calls, so give each one its own fake reply.
  function stubFetchRouted({ region = { isEUAccessOnly: false } } = {}) {
    const fetchMock = vi.fn((url) => {
      if (url.includes('/api/tools/cluster-region/')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => region,
        });
      }
      return Promise.resolve({
        status: 200,
        json: async () => ({ session_id: 's1', companion_public_key: 'k1' }),
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  }

  function makePkReq(body = {}) {
    return {
      body: {
        public_key: 'abc',
        clusterUrl: SKR_URL,
        oidcIssuerUrl: KYMA_ISSUER,
        ...body,
      },
      log: { warn: vi.fn() },
      id: 'req-1234',
    };
  }

  it('refuses the key exchange (403) when the OIDC issuer mismatches', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = makeMockRes();
    await handlePublicKey(
      makePkReq({ oidcIssuerUrl: 'https://other.ias.example.com' }),
      res,
    );

    expect(res._status).toBe(403);
    expect(res._body.reason).toBe('issuer-mismatch');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('refuses the key exchange (403) for an EU Access Only cluster', async () => {
    const fetchMock = stubFetchRouted({ region: { isEUAccessOnly: true } });

    const res = makeMockRes();
    await handlePublicKey(makePkReq(), res);

    expect(res._status).toBe(403);
    expect(res._body.reason).toBe('eu-access');
    expect(
      fetchMock.mock.calls.some(([url]) => url.includes('/api/public-key')),
    ).toBe(false);
  });

  it('performs the key exchange for an eligible cluster', async () => {
    const fetchMock = stubFetchRouted();

    const res = makeMockRes();
    await handlePublicKey(makePkReq({ oidcIssuerUrl: KYMA_ISSUER }), res);

    expect(res._status).toBe(200);
    expect(res._body.session_id).toBe('s1');
    expect(
      fetchMock.mock.calls.some(([url]) => url.includes('/api/public-key')),
    ).toBe(true);
  });
});

describe('handleJouleEligibility', () => {
  let handleJouleEligibility;

  beforeEach(async () => {
    vi.resetModules();
    mockConfig();
    handleJouleEligibility = (await import('./companionRouter.js'))
      .handleJouleEligibility;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns eligible: false without fetching when the OIDC issuer mismatches', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = makeMockRes();
    await handleJouleEligibility(
      makeMockReq({ oidcIssuerUrl: 'https://other.ias.example.com' }),
      res,
    );

    expect(res._body).toEqual({ eligible: false, reason: 'issuer-mismatch' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats issuers differing only by a trailing slash as a match', async () => {
    stubRegion({ data: { isEUAccessOnly: false } });
    const res = makeMockRes();
    await handleJouleEligibility(
      makeMockReq({ oidcIssuerUrl: `${KYMA_ISSUER}/` }),
      res,
    );
    expect(res._body).toEqual({ eligible: true });
  });

  it('fails static-token kubeconfigs (no OIDC issuer) without fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = makeMockRes();
    await handleJouleEligibility(
      makeMockReq({ oidcIssuerUrl: undefined }),
      res,
    );
    expect(res._body).toEqual({ eligible: false, reason: 'static-token' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('lets client-cert kubeconfigs skip the issuer check', async () => {
    stubRegion({ data: { isEUAccessOnly: false } });
    const res = makeMockRes();
    await handleJouleEligibility(
      makeMockReq({
        oidcIssuerUrl: undefined,
        clusterToken: undefined,
        clientCertificateData: 'cert',
        clientKeyData: 'key',
      }),
      res,
    );
    expect(res._body).toEqual({ eligible: true });
  });

  it('skips the issuer check entirely when no issuerUrl is configured', async () => {
    vi.resetModules();
    mockConfig({ apiBaseUrl: 'https://companion.example.com' });
    const { handleJouleEligibility: handler } =
      await import('./companionRouter.js');
    stubRegion({ data: { isEUAccessOnly: false } });

    const res = makeMockRes();
    await handler(makeMockReq({ oidcIssuerUrl: undefined }), res);
    expect(res._body).toEqual({ eligible: true });
  });

  it('returns eligible: true for a non-EU cluster with a matching issuer', async () => {
    stubRegion({ data: { isEUAccessOnly: false } });
    const res = makeMockRes();
    await handleJouleEligibility(
      makeMockReq({ oidcIssuerUrl: KYMA_ISSUER }),
      res,
    );
    expect(res._body).toEqual({ eligible: true });
  });

  it('returns eligible: false for an EU Access Only cluster', async () => {
    stubRegion({ data: { isEUAccessOnly: true } });
    const res = makeMockRes();
    await handleJouleEligibility(makeMockReq(), res);
    expect(res._body).toEqual({ eligible: false, reason: 'eu-access' });
  });

  it('returns eligible: false (not-skr) without fetching for a non-SKR cluster', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const res = makeMockRes();
    await handleJouleEligibility(
      makeMockReq({ clusterUrl: 'https://k8s.example.com' }),
      res,
    );
    expect(res._body).toEqual({ eligible: false, reason: 'not-skr' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns eligible: false (unknown) when the region lacks a boolean isEUAccessOnly', async () => {
    stubRegion({ data: {} });
    const res = makeMockRes();
    await handleJouleEligibility(makeMockReq(), res);
    expect(res._body).toEqual({ eligible: false, reason: 'unknown' });
  });

  it('sends the service Authorization header to the companion API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await handleJouleEligibility(makeMockReq(), makeMockRes());

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/api/tools/cluster-region/c-abc123');
    expect(opts.headers.Authorization).toBe('Bearer mock-token');
  });

  it('caches the region so a second request does not hit the companion API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await handleJouleEligibility(makeMockReq(), makeMockRes());
    await handleJouleEligibility(makeMockReq(), makeMockRes());
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('does not cache transient 5xx region failures', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ isEUAccessOnly: false }),
      });
    vi.stubGlobal('fetch', fetchMock);

    const res1 = makeMockRes();
    await handleJouleEligibility(makeMockReq(), res1);
    expect(res1._body).toEqual({ eligible: false, reason: 'unknown' });

    const res2 = makeMockRes();
    await handleJouleEligibility(makeMockReq(), res2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res2._body).toEqual({ eligible: true });
  });

  it('negatively caches 404 region responses', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 404, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await handleJouleEligibility(makeMockReq(), makeMockRes());
    const res2 = makeMockRes();
    await handleJouleEligibility(makeMockReq(), res2);
    expect(fetchMock).toHaveBeenCalledOnce(); // served from the negative cache
    expect(res2._body).toEqual({ eligible: false, reason: 'unknown' });
  });

  it('returns 500 when the region fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    const res = makeMockRes();
    await handleJouleEligibility(makeMockReq(), res);
    expect(res._status).toBe(500);
    expect(res._body.eligible).toBe(false);
  });
});

describe('rejectEUAccessOnly (companion routes gate)', () => {
  let rejectEUAccessOnly;

  beforeEach(async () => {
    vi.resetModules();
    mockConfig();
    rejectEUAccessOnly = (await import('./companionRouter.js'))
      .rejectEUAccessOnly;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('blocks requests for an EU Access Only cluster with 403', async () => {
    stubRegion({ data: { isEUAccessOnly: true } });
    const res = makeMockRes();
    const next = vi.fn();

    await rejectEUAccessOnly(makeMockReq(), res, next);

    expect(res._status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('passes requests for a non-EU cluster through', async () => {
    stubRegion({ data: { isEUAccessOnly: false } });
    const res = makeMockRes();
    const next = vi.fn();

    await rejectEUAccessOnly(makeMockReq(), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res._status).toBeNull();
  });

  it('passes non-SKR clusters through without a region lookup', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const res = makeMockRes();
    const next = vi.fn();

    await rejectEUAccessOnly(
      makeMockReq({ clusterUrl: 'https://k8s.example.com' }),
      res,
      next,
    );

    expect(next).toHaveBeenCalledOnce();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('passes requests through when the region lookup fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')));
    const res = makeMockRes();
    const next = vi.fn();

    await rejectEUAccessOnly(makeMockReq(), res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res._status).toBeNull();
  });
});
