import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFetchFn } from '../useFetch';

const mockCreateHeaders = vi.fn((..._args: unknown[]) => ({
  'X-K8s-Authorization': 'Bearer t',
}));
const mockThrowHttpError = vi.fn();
const mockCheckForTokenExpiration = vi.fn();

vi.mock('shared/hooks/BackendAPI/createHeaders', () => ({
  createHeaders: (...args: unknown[]) => mockCreateHeaders(...args),
}));

vi.mock('shared/hooks/BackendAPI/config', () => ({
  throwHttpError: (...args: unknown[]) => mockThrowHttpError(...args),
}));

vi.mock('state/utils/getBackendInfo', () => ({
  getClusterConfig: () => ({ backendAddress: '/backend' }),
}));

vi.mock('state/ssoDataAtom', () => ({
  checkForTokenExpiration: (...args: unknown[]) =>
    mockCheckForTokenExpiration(...args),
  // only used by the useFetch React wrapper, not exercised here
  useIsSSOEnabled: () => false,
  ssoDataAtom: {},
  authDataAtom: {},
}));

const baseArgs = {
  authData: { token: 'my-token' },
  cluster: {},
  ssoData: null,
  isSSOEnabled: false,
} as unknown as Parameters<typeof createFetchFn>[0];

// Loosely typed stand-in for the global fetch so mock helpers stay available.
const fetchMock = vi.fn();

describe('createFetchFn', () => {
  beforeEach(() => {
    mockCreateHeaders.mockClear();
    mockThrowHttpError.mockReset();
    mockCheckForTokenExpiration.mockReset();
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('prefixes the backend address, injects headers, and returns the response', async () => {
    const okResponse = { ok: true, json: () => Promise.resolve({}) };
    fetchMock.mockResolvedValue(okResponse);

    const fetchFn = createFetchFn(baseArgs);
    const response = await fetchFn({ relativeUrl: '/api/v1/pods' });

    expect(response).toBe(okResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      '/backend/api/v1/pods',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-K8s-Authorization': 'Bearer t',
        }),
      }),
    );
    expect(mockCheckForTokenExpiration).toHaveBeenCalled();
  });

  it('passes the abort signal and merges caller-supplied init', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const abortController = new AbortController();

    const fetchFn = createFetchFn(baseArgs);
    await fetchFn({
      relativeUrl: '/api/v1/pods',
      abortController,
      init: { method: 'GET', headers: { Accept: 'application/json' } },
    });

    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('GET');
    expect(init.signal).toBe(abortController.signal);
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      'X-K8s-Authorization': 'Bearer t',
    });
  });

  it('throws the parsed HttpError for a 403 response', async () => {
    const forbidden = { ok: false, status: 403 };
    fetchMock.mockResolvedValue(forbidden);
    const httpError = new Error(
      'You are not allowed to perform this operation',
    );
    mockThrowHttpError.mockResolvedValue(httpError);

    const fetchFn = createFetchFn(baseArgs);

    await expect(fetchFn({ relativeUrl: '/api/v1/secrets' })).rejects.toBe(
      httpError,
    );
    expect(mockThrowHttpError).toHaveBeenCalledWith(forbidden);
  });

  it('throws the parsed HttpError for a 404 response', async () => {
    const notFound = { ok: false, status: 404 };
    fetchMock.mockResolvedValue(notFound);
    const httpError = new Error('Definition not found');
    mockThrowHttpError.mockResolvedValue(httpError);

    const fetchFn = createFetchFn(baseArgs);

    await expect(fetchFn({ relativeUrl: '/apis/x/v1/foos' })).rejects.toBe(
      httpError,
    );
    expect(mockThrowHttpError).toHaveBeenCalledWith(notFound);
  });

  it('propagates a network-level fetch rejection', async () => {
    const networkError = new TypeError('Failed to fetch');
    fetchMock.mockRejectedValue(networkError);

    const fetchFn = createFetchFn(baseArgs);

    await expect(fetchFn({ relativeUrl: '/api/v1/pods' })).rejects.toBe(
      networkError,
    );
    expect(mockThrowHttpError).not.toHaveBeenCalled();
  });

  it('defers the request while SSO login is still in progress', async () => {
    const fetchFn = createFetchFn({
      ...baseArgs,
      isSSOEnabled: true,
      ssoData: null,
    });

    await expect(fetchFn({ relativeUrl: '/api/v1/pods' })).rejects.toThrow(
      'SSO login is in progress; request deferred.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
