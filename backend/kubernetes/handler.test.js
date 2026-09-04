import { afterEach, describe, expect, it, vi } from 'vitest';
import dns from 'dns/promises';
import { handleK8sRequests } from './handler.js';
import { PrivateIPUsedError } from '../utils/network-utils.js';

const makeReq = (overrides = {}) => ({
  headers: {
    'x-cluster-url': 'https://attacker-controlled.example.com',
    'x-k8s-authorization': 'Bearer test-token',
  },
  originalUrl: '/backend/api/v1/namespaces',
  method: 'GET',
  body: Buffer.from(''),
  log: { warn: vi.fn(), error: vi.fn() },
  id: 'test-req-id',
  ...overrides,
});

const makeRes = () => {
  const res = {
    headersSent: false,
    contentType: vi.fn(),
    writeHead: vi.fn(),
    send: vi.fn(),
    status: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe('handleK8sRequests', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('responds with 502 and PrivateIPUsedError when cluster hostname DNS-resolves to a private IP', async () => {
    vi.spyOn(dns, 'lookup').mockResolvedValue([
      { address: '10.0.0.1', family: 4 },
    ]);

    const req = makeReq();
    const res = makeRes();

    await handleK8sRequests(req, res);

    expect(res.status).toHaveBeenCalledWith(502);
    expect(req.log.warn).toHaveBeenCalledWith(
      expect.objectContaining({ err: expect.any(PrivateIPUsedError) }),
      expect.any(String),
    );
  });
});
