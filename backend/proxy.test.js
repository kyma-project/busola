import { vi } from 'vitest';

vi.mock('./utils/network-utils.js', () => ({
  isValidHost: vi.fn(),
  isPrivateAddressCached: vi.fn(),
}));

import { isValidHost, isPrivateAddressCached } from './utils/network-utils.js';
import { proxyHandler, buildSafeProxyHeaders } from './proxy.js';

function makeReq(overrides = {}) {
  return {
    query: {},
    headers: {},
    method: 'GET',
    body: null,
    log: { error: vi.fn() },
    ...overrides,
  };
}

function makeRes() {
  const res = {
    headersSent: false,
    writeHead: vi.fn(),
    status: vi.fn(),
    send: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe('proxyHandler — input validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isValidHost.mockReturnValue(true);
    isPrivateAddressCached.mockResolvedValue(false);
  });

  test('missing url query param → 400', async () => {
    const req = makeReq({ query: {} });
    const res = makeRes();
    await proxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Bad Request');
  });

  test('http:// url → 403', async () => {
    const req = makeReq({ query: { url: 'http://example.com/data' } });
    const res = makeRes();
    await proxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Request Forbidden');
  });

  test('file:// url → 403', async () => {
    const req = makeReq({ query: { url: 'file:///etc/passwd' } });
    const res = makeRes();
    await proxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Request Forbidden');
  });

  test('localhost hostname (isValidHost=false) → 403', async () => {
    isValidHost.mockReturnValue(false);
    const req = makeReq({ query: { url: 'https://localhost/data' } });
    const res = makeRes();
    await proxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Request Forbidden');
  });

  test('hostname resolving to private IP → 403', async () => {
    isPrivateAddressCached.mockResolvedValue(true);
    const req = makeReq({
      query: { url: 'https://internal.example.com/data' },
    });
    const res = makeRes();
    await proxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Request Forbidden');
  });

  test('malformed URL string → 502', async () => {
    const req = makeReq({ query: { url: 'not a url %%' } });
    const res = makeRes();
    await proxyHandler(req, res);
    expect(res.status).toHaveBeenCalledWith(502);
  });
});

describe('buildSafeProxyHeaders', () => {
  test('forwards allowed headers and adds x-content-type-options: nosniff', () => {
    const upstream = {
      'content-type': 'application/json',
      'content-length': '42',
      etag: '"abc123"',
      'set-cookie': 'session=secret; HttpOnly',
      'x-custom-header': 'attacker-value',
      location: 'https://evil.example.com/',
    };
    const safe = buildSafeProxyHeaders(upstream);
    expect(safe['x-content-type-options']).toBe('nosniff');
    expect(safe['content-type']).toBe('application/json');
    expect(safe['content-length']).toBe('42');
    expect(safe['etag']).toBe('"abc123"');
    expect(safe['set-cookie']).toBeUndefined();
    expect(safe['x-custom-header']).toBeUndefined();
    expect(safe['location']).toBeUndefined();
  });

  test('x-content-type-options: nosniff is set even when upstream sends no headers', () => {
    const safe = buildSafeProxyHeaders({});
    expect(safe['x-content-type-options']).toBe('nosniff');
  });
});
