import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getJouleEligibility } from './getJouleEligibility';

const fetchMock = vi.fn();

const params = {
  clusterUrl: 'https://api.cluster.example',
  certificateAuthorityData: 'ca-data',
  token: 'cluster-token',
  oidcIssuerUrl: 'https://kyma.accounts.example',
};

describe('getJouleEligibility', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('posts the cluster details and returns the verdict', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ eligible: false, reason: 'eu-access' }),
    });
    const { signal } = new AbortController();

    const result = await getJouleEligibility(params, signal);

    expect(result).toEqual({ eligible: false, reason: 'eu-access' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/backend/ai-chat/joule-eligibility');
    expect(init.method).toBe('POST');
    expect(init.signal).toBe(signal);
    expect(JSON.parse(init.body)).toEqual({
      clusterUrl: 'https://api.cluster.example',
      certificateAuthorityData: 'ca-data',
      clusterToken: 'cluster-token',
      oidcIssuerUrl: 'https://kyma.accounts.example',
    });
  });

  it('sends the client certificate pair for certificate auth', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ eligible: true }),
    });

    await getJouleEligibility({
      clusterUrl: 'https://api.cluster.example',
      clientCertificateData: 'cert',
      clientKeyData: 'key',
    });

    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      clusterUrl: 'https://api.cluster.example',
      clientCertificateData: 'cert',
      clientKeyData: 'key',
    });
  });

  it('throws with the status code when the backend responds with an error', async () => {
    const json = vi.fn();
    fetchMock.mockResolvedValue({ ok: false, status: 503, json });

    await expect(getJouleEligibility(params)).rejects.toThrow('HTTP 503');
    expect(json).not.toHaveBeenCalled();
  });

  it('lets a rejected request propagate to the caller', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValue(abortError);

    await expect(getJouleEligibility(params)).rejects.toBe(abortError);
  });
});
