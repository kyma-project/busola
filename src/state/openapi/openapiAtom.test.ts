import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createStore } from 'jotai';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { openapiAtom } from './openapiAtom';

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('openapiAtom', () => {
  let resolveFetch: (response: unknown) => void;
  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    fetchMock.mockReset();
    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function makeStore() {
    const store = createStore();
    store.set(configurationAtom, {
      features: { SSO_LOGIN: { isEnabled: true } },
    } as never);
    store.set(clusterAtom, {
      name: 'foo',
      currentContext: { cluster: { cluster: { server: 'https://k8s' } } },
    } as never);
    store.set(authDataAtom, { token: 'cluster-token' });
    store.set(ssoDataAtom, { id_token: 'sso-token' } as never);
    return store;
  }

  it('does not loop when an old request returns after the SSO session was dropped', async () => {
    const store = makeStore();
    let notifications = 0;
    // If this regresses it loops forever and hangs the test run, so stop listening after 200 updates.
    const unsubscribe = store.sub(openapiAtom, () => {
      if (++notifications > 200) unsubscribe();
    });
    expect(store.get(openapiAtom)).toEqual({ state: 'loading' });
    await tick();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Without an SSO session the next request is refused at once.
    store.set(ssoDataAtom, null);
    await tick();
    expect(store.get(openapiAtom)).toMatchObject({ state: 'hasError' });

    // The first request returns late.
    resolveFetch({ ok: true, json: async () => ({ swagger: '2.0' }) });
    await tick();

    expect(notifications).toBeLessThan(10);
    expect(store.get(openapiAtom)).toMatchObject({
      state: 'hasError',
      error: { message: expect.stringContaining('SSO login is in progress') },
    });
    unsubscribe();
  });

  it('reports the schema once the request succeeds', async () => {
    const store = makeStore();
    const unsubscribe = store.sub(openapiAtom, () => {});
    store.get(openapiAtom);
    await tick();

    resolveFetch({ ok: true, json: async () => ({ swagger: '2.0' }) });
    await tick();

    expect(store.get(openapiAtom)).toEqual({
      state: 'hasData',
      data: { swagger: '2.0' },
    });
    unsubscribe();
  });

  it.each([401, 500])(
    'reports an HTTP %s response as an error',
    async (status) => {
      const store = makeStore();
      const unsubscribe = store.sub(openapiAtom, () => {});
      store.get(openapiAtom);
      await tick();

      resolveFetch({
        ok: false,
        status,
        json: async () => ({ message: 'request failed', status, code: status }),
      });
      await tick();

      expect(store.get(openapiAtom)).toMatchObject({
        state: 'hasError',
        error: { code: status, status },
      });
      unsubscribe();
    },
  );

  it('has no data when no cluster is logged in', async () => {
    const store = makeStore();
    store.set(authDataAtom, null);
    const unsubscribe = store.sub(openapiAtom, () => {});
    store.get(openapiAtom);
    await tick();

    expect(store.get(openapiAtom)).toEqual({ state: 'hasData', data: null });
    expect(fetchMock).not.toHaveBeenCalled();
    unsubscribe();
  });
});
