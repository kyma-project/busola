import { createFetchFn } from '../useFetch';

const mockCreateHeaders = vi.fn(() => ({ 'X-K8s-Authorization': 'Bearer t' }));
const mockThrowHttpError = vi.fn();
const mockCheckForTokenExpiration = vi.fn();

vi.mock('shared/hooks/BackendAPI/createHeaders', () => ({
  createHeaders: (...args) => mockCreateHeaders(...args),
}));

vi.mock('shared/hooks/BackendAPI/config', () => ({
  throwHttpError: (...args) => mockThrowHttpError(...args),
}));

vi.mock('state/utils/getBackendInfo', () => ({
  getClusterConfig: () => ({ backendAddress: '/backend' }),
}));

vi.mock('state/ssoDataAtom', () => ({
  checkForTokenExpiration: (...args) => mockCheckForTokenExpiration(...args),
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
};

describe('createFetchFn', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockCreateHeaders.mockClear();
    mockThrowHttpError.mockReset();
    mockCheckForTokenExpiration.mockReset();
    global.fetch = vi.fn();
  });

  it('prefixes the backend address, injects headers, and returns the response', async () => {
    const okResponse = { ok: true, json: () => Promise.resolve({}) };
    global.fetch.mockResolvedValue(okResponse);

    const fetchFn = createFetchFn(baseArgs);
    const response = await fetchFn({ relativeUrl: '/api/v1/pods' });

    expect(response).toBe(okResponse);
    expect(global.fetch).toHaveBeenCalledWith(
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
    global.fetch.mockResolvedValue({ ok: true });
    const abortController = new AbortController();

    const fetchFn = createFetchFn(baseArgs);
    await fetchFn({
      relativeUrl: '/api/v1/pods',
      abortController,
      init: { method: 'GET', headers: { Accept: 'application/json' } },
    });

    const init = global.fetch.mock.calls[0][1];
    expect(init.method).toBe('GET');
    expect(init.signal).toBe(abortController.signal);
    expect(init.headers).toMatchObject({
      Accept: 'application/json',
      'X-K8s-Authorization': 'Bearer t',
    });
  });

  it('throws the parsed HttpError for a 403 response', async () => {
    const forbidden = { ok: false, status: 403 };
    global.fetch.mockResolvedValue(forbidden);
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
    global.fetch.mockResolvedValue(notFound);
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
    global.fetch.mockRejectedValue(networkError);

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
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
