import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import dns from 'dns/promises';
import https from 'https';
import { handleK8sRequests } from './handler.js';
import { PrivateIPUsedError } from '../utils/network-utils.js';
import config from '../src/config/config.js';

vi.mock('../src/config/config.js', () => ({
  default: { features: { ALLOW_PRIVATE_IPS: { isEnabled: false } } },
}));

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

const mockAbortingRequest = () =>
  vi.spyOn(https, 'request').mockImplementation(() => {
    const k8sRequest = {
      on: (event, handler) => {
        // Settle the handler's internal promise so the awaited call returns.
        if (event === 'error') {
          setImmediate(() => handler(new Error('mock-abort')));
        }
        return k8sRequest;
      },
      end: vi.fn(),
      destroy: vi.fn(),
    };
    return k8sRequest;
  });

describe('handleK8sRequests', () => {
  beforeEach(() => {
    // Default to the secure posture; individual tests opt in to allowing
    // private IPs by mutating the mocked config.
    config.features.ALLOW_PRIVATE_IPS.isEnabled = false;
  });

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

  it('does not attach the private-IP lookup guard when ALLOW_PRIVATE_IPS is enabled', async () => {
    config.features.ALLOW_PRIVATE_IPS.isEnabled = true;
    const requestSpy = mockAbortingRequest();

    const req = makeReq();
    const res = makeRes();

    await handleK8sRequests(req, res);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const options = requestSpy.mock.calls[0][0];
    expect(options.lookup).toBeUndefined();
  });

  it('attaches the private-IP lookup guard when ALLOW_PRIVATE_IPS is disabled', async () => {
    const requestSpy = mockAbortingRequest();

    const req = makeReq();
    const res = makeRes();

    await handleK8sRequests(req, res);

    expect(requestSpy).toHaveBeenCalledTimes(1);
    const options = requestSpy.mock.calls[0][0];
    expect(typeof options.lookup).toBe('function');
  });
});
