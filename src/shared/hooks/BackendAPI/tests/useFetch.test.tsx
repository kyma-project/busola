import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { ReactNode } from 'react';
import { JotaiHydrator } from 'testing/reactTestingUtils';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom, ActiveClusterState } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { useFetch } from '../useFetch';

const clusterFixture = {
  currentContext: {
    cluster: {
      cluster: {
        server: 'https://api.my-cluster.example.com',
        'certificate-authority-data': 'ca-data-abc',
      },
    },
  },
} as unknown as ActiveClusterState;

type AtomPairs = [any, unknown][];

function makeWrapper(atoms: AtomPairs) {
  return ({ children }: { children: ReactNode }) => (
    <Provider>
      <JotaiHydrator initialValues={atoms}>{children}</JotaiHydrator>
    </Provider>
  );
}

// Renders useFetch with hydrated atoms and returns the fetch function it produces.
function renderFetchFn(atoms: AtomPairs) {
  const { result } = renderHook(() => useFetch(), {
    wrapper: makeWrapper(atoms),
  });
  return result.current;
}

const loggedIn: AtomPairs = [
  [authDataAtom, { token: 'my-token' }],
  [clusterAtom, clusterFixture],
  [ssoDataAtom, null],
];

const fetchMock = vi.fn();

describe('useFetch', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('builds a fetch function that prefixes the backend address and injects headers', async () => {
    const okResponse = { ok: true, json: () => Promise.resolve({}) };
    fetchMock.mockResolvedValue(okResponse);

    const fetchFn = renderFetchFn(loggedIn);
    const response = await fetchFn({ relativeUrl: '/api/v1/pods' });

    expect(response).toBe(okResponse);
    expect(fetchMock).toHaveBeenCalledWith(
      '/backend/api/v1/pods',
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-K8s-Authorization': 'Bearer my-token',
          'X-Cluster-Url': 'https://api.my-cluster.example.com',
        }),
      }),
    );
  });

  it('passes the abort signal and merges caller-supplied init', async () => {
    fetchMock.mockResolvedValue({ ok: true });
    const abortController = new AbortController();

    const fetchFn = renderFetchFn(loggedIn);
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
      'X-K8s-Authorization': 'Bearer my-token',
    });
  });

  it('rejects with a masked HttpError on a 403 response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: () => Promise.resolve({ status: 403, message: 'forbidden' }),
    });

    const fetchFn = renderFetchFn(loggedIn);
    const error = await fetchFn({ relativeUrl: '/api/v1/secrets' }).catch(
      (e) => e,
    );

    expect(error.status).toBe(403);
    expect(error.message).toBe('You are not allowed to perform this operation');
  });

  it('rejects on a 404 response', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ code: 404, message: 'not found' }),
    });

    const fetchFn = renderFetchFn(loggedIn);
    const error = await fetchFn({ relativeUrl: '/apis/x/v1/foos' }).catch(
      (e) => e,
    );

    expect(error.code).toBe(404);
    expect(error.message).toBe('not found');
  });

  it('propagates a network-level fetch rejection', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    const fetchFn = renderFetchFn(loggedIn);

    await expect(fetchFn({ relativeUrl: '/api/v1/pods' })).rejects.toThrow(
      'Failed to fetch',
    );
  });

  it('defers the request while SSO login is still in progress', async () => {
    const fetchFn = renderFetchFn([
      ...loggedIn,
      [ssoDataAtom, null],
      [configurationAtom, { features: { SSO_LOGIN: { isEnabled: true } } }],
    ]);

    await expect(fetchFn({ relativeUrl: '/api/v1/pods' })).rejects.toThrow(
      'SSO login is in progress; request deferred.',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
