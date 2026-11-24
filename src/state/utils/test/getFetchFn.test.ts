import { describe, it, expect, vi, beforeEach } from 'vitest';
import { atom, createStore } from 'jotai';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { configurationAtom } from 'state/configuration/configurationAtom';

vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  createFetchFn: vi.fn(),
}));

const { getFetchFn } = await import('../getFetchFn');
const { createFetchFn } = await import('shared/hooks/BackendAPI/useFetch');
const mockCreateFetchFn = vi.mocked(createFetchFn);
const mockFetchFn = vi.fn();

const cluster = {
  name: 'test-cluster',
  contextName: 'test-cluster',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

const authData = { token: 'my-token' };
const ssoData = { id_token: 'sso-token' } as any;

describe('getFetchFn', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockCreateFetchFn.mockClear();
    mockCreateFetchFn.mockReturnValue(mockFetchFn);
  });

  it('returns undefined when authData is null', () => {
    const store = createStore();
    store.set(authDataAtom, null);
    store.set(clusterAtom, cluster);

    const result = getFetchFn(store.get);

    expect(result).toBeUndefined();
  });

  it('returns undefined when cluster is null', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, null);

    const result = getFetchFn(store.get);

    expect(result).toBeUndefined();
  });

  it('returns a fetch function when both authData and cluster are set', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);

    const result = getFetchFn(store.get);

    expect(result).toBe(mockFetchFn);
  });

  it('passes authData, cluster, and ssoData to createFetchFn', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);
    store.set(ssoDataAtom, ssoData);

    getFetchFn(store.get);

    expect(mockCreateFetchFn).toHaveBeenCalledWith({
      authData,
      cluster,
      sso: { isReady: true, data: ssoData },
    });
  });

  it('passes null ssoData when ssoDataAtom is unset', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);
    store.set(ssoDataAtom, null);

    getFetchFn(store.get);

    expect(mockCreateFetchFn).toHaveBeenCalledWith({
      authData,
      cluster,
      sso: { isReady: true, data: null },
    });
  });

  it('passes a not-ready SSO state while the SSO login has no session', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);
    store.set(configurationAtom, {
      features: { SSO_LOGIN: { isEnabled: true } },
    });
    store.set(ssoDataAtom, null);

    getFetchFn(store.get);

    expect(mockCreateFetchFn).toHaveBeenCalledWith(
      expect.objectContaining({ sso: { isReady: false, data: null } }),
    );
  });

  it('does not run again when an unrelated configuration change happens', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);
    store.set(configurationAtom, { features: {} });
    const fetchFnAtom = atom((get) => getFetchFn(get));
    store.sub(fetchFnAtom, () => {});
    mockCreateFetchFn.mockClear();

    store.set(configurationAtom, {
      features: { COMMUNITY_MODULES: { isEnabled: true } },
    });
    store.get(fetchFnAtom);

    expect(mockCreateFetchFn).not.toHaveBeenCalled();
  });
});
