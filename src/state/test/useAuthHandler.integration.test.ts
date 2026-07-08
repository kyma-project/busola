import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';

// Integration test for useAuthHandler: drives the full silent-renewal loop
// through a mocked oidc-client-ts UserManager.

// Handler references captured from the UserManager mock so tests can fire
// the same events oidc-client-ts would.
let capturedExpiringHandler: (() => Promise<void>) | null = null;
const capturedRemoveExpiring = vi.fn();
const capturedAddExpiring = vi.fn();

const mockSigninSilent = vi.fn();
const mockSigninRedirect = vi.fn();
const mockClearStaleState = vi.fn().mockResolvedValue(undefined);
const mockGetUser = vi.fn();

class MockUserManager {
  events = {
    addAccessTokenExpiring: (h: () => Promise<void>) => {
      capturedExpiringHandler = h;
      capturedAddExpiring(h);
    },
    removeAccessTokenExpiring: capturedRemoveExpiring,
  };
  getUser = mockGetUser;
  signinSilent = mockSigninSilent;
  signinRedirect = mockSigninRedirect;
  clearStaleState = mockClearStaleState;
}

vi.mock('oidc-client-ts', () => ({
  UserManager: MockUserManager,
  User: class {},
}));

// oidc-params.ts parses the kubeconfig with regex; feed it a fake result.
vi.mock('components/Clusters/components/oidc-params', () => ({
  parseOIDCparams: () => ({
    issuerUrl: 'https://issuer.example.com',
    clientId: 'test-client',
    clientSecret: '',
    scopes: [],
    useAccessToken: false,
  }),
  isOIDCExec: () => true,
}));

const mockNotifyError = vi.fn();
vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({ notifyError: mockNotifyError }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

// Imported lazily so the mocks above are wired before module init.
const { useAuthHandler, authDataAtom, authUserManagerRef } =
  await import('../authDataAtom');
const { clusterAtom } = await import('../clusterAtom');
const { saveIntendedPath, getIntendedPath, clearIntendedPath } =
  await import('../intendedPathAtom');

// Minimal cluster shape that passes hasNonOidcAuth() === false and
// isOIDCExec() === true.
function makeOidcCluster(name: string) {
  return {
    name,
    contextName: name,
    kubeconfig: {} as any,
    config: { storage: 'sessionStorage' as const },
    currentContext: {
      cluster: {} as any,
      namespace: '',
      user: {
        name: 'user',
        user: {
          exec: {
            args: [
              '--oidc-issuer-url=https://issuer.example.com',
              '--oidc-client-id=test-client',
            ],
          },
        } as any,
      },
    } as any,
  };
}

function makeWrapper(store: ReturnType<typeof createStore>) {
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/cluster/foo/namespaces/bar'] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

async function flushMicrotasks() {
  // One flush for handleLogin(), one for the .then() chain.
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe('useAuthHandler integration — full silent-renew flow', () => {
  beforeEach(() => {
    mockSigninSilent.mockReset();
    mockSigninRedirect.mockReset();
    mockClearStaleState.mockClear();
    mockGetUser.mockReset();
    capturedRemoveExpiring.mockReset();
    capturedAddExpiring.mockReset();
    capturedExpiringHandler = null;
    mockNotifyError.mockReset();
    sessionStorage.clear();
    localStorage.clear();
    authUserManagerRef.current = null;

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  afterEach(() => {
    authUserManagerRef.current = null;
  });

  it('populates authDataAtom with the initial token when a valid user is stored', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'initial-access',
    });

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });

    await flushMicrotasks();

    expect(store.get(authDataAtom)).toEqual({ token: 'initial-token' });
    expect(authUserManagerRef.current).not.toBeNull();
  });

  it('updates the token in authDataAtom after a successful silent renew', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'initial-access',
    });
    mockSigninSilent.mockResolvedValue({
      id_token: 'renewed-token',
      access_token: 'renewed-access',
    });

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });

    await flushMicrotasks();
    expect(store.get(authDataAtom)).toEqual({ token: 'initial-token' });

    // Fire the addAccessTokenExpiring event.
    await act(async () => {
      await capturedExpiringHandler?.();
    });

    expect(mockSigninSilent).toHaveBeenCalledTimes(1);
    expect(store.get(authDataAtom)).toEqual({ token: 'renewed-token' });
    // Silent path: no IdP redirect, no toast.
    expect(mockSigninRedirect).not.toHaveBeenCalled();
    expect(mockNotifyError).not.toHaveBeenCalled();
  });

  it('triggers IdP round-trip (saveIntendedPath + signinRedirect) when silent renew fails', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    mockSigninSilent.mockRejectedValue(new Error('invalid_grant'));
    mockSigninRedirect.mockResolvedValue(undefined);

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    await act(async () => {
      await capturedExpiringHandler?.();
    });

    await waitFor(() => {
      expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
    });
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
    expect(mockNotifyError).not.toHaveBeenCalled();
  });

  it('surfaces a toast when both silent renew AND signinRedirect fail', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    mockSigninSilent.mockRejectedValue(new Error('invalid_grant'));
    mockSigninRedirect.mockRejectedValue(new Error('IdP unreachable'));

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    await act(async () => {
      await capturedExpiringHandler?.();
    });

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledTimes(1);
    });
    expect(mockNotifyError.mock.calls[0][0].content).toContain(
      'common.errors.session-not-renewed',
    );

    // Otherwise a later cluster pick would reuse the stale path.
    expect(getIntendedPath()).toBeNull();
  });

  it('falls back to /clusters + toast when the stale-state recovery redirect fails', async () => {
    // Stale OIDC storage triggers clearStaleState + signinRedirect. If that
    // redirect also fails the user gets a toast, not an infinite spinner.
    mockGetUser.mockRejectedValue(new Error('authority mismatch'));
    mockSigninRedirect.mockRejectedValue(new Error('IdP unreachable'));

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    await waitFor(() => {
      expect(mockNotifyError).toHaveBeenCalledTimes(1);
    });
    expect(mockNotifyError.mock.calls[0][0].content).toContain(
      'common.errors.session-not-renewed',
    );
    expect(mockClearStaleState).toHaveBeenCalled();
  });

  it('collapses two back-to-back addAccessTokenExpiring events into one signinSilent', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    let resolveRenew: (u: any) => void = () => {};
    mockSigninSilent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    // Fire twice in the same tick.
    const p1 = capturedExpiringHandler?.();
    const p2 = capturedExpiringHandler?.();

    expect(mockSigninSilent).toHaveBeenCalledTimes(1);

    resolveRenew({ id_token: 'renewed', access_token: 'x' });
    await act(async () => {
      await Promise.all([p1, p2]);
    });

    expect(store.get(authDataAtom)).toEqual({ token: 'renewed' });
  });

  it('detaches silent-renew listeners on cluster change and does not stack them', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    mockSigninSilent.mockResolvedValue({
      id_token: 'renewed',
      access_token: 'x',
    });

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    // Switch clusters; the old manager's listeners must be detached.
    act(() => {
      store.set(clusterAtom, makeOidcCluster('bar') as any);
    });
    await flushMicrotasks();

    expect(capturedRemoveExpiring).toHaveBeenCalledTimes(1);
  });

  it('clears intendedPath after useIntendedPathRestore consumes it (post-reauth)', async () => {
    // The dedicated useIntendedPathRestore test asserts the restore itself;
    // this test just confirms the failure path stores a consumable value.
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    mockSigninSilent.mockRejectedValue(new Error('invalid_grant'));
    mockSigninRedirect.mockResolvedValue(undefined);

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    await act(async () => {
      await capturedExpiringHandler?.();
    });
    await waitFor(() => {
      expect(getIntendedPath()?.path).toBeTruthy();
    });

    const path = getIntendedPath()?.path;
    expect(path).toBe('/namespaces/bar');

    clearIntendedPath();
    saveIntendedPath('/namespaces/qux');
    expect(getIntendedPath()?.path).toBe('/namespaces/qux');
  });

  it('unmount → remount does not leave listeners stacked (StrictMode invariant)', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    mockSigninSilent.mockResolvedValue({
      id_token: 'renewed',
      access_token: 'x',
    });

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    // Mimic StrictMode: mount, unmount, remount. The unmount must fire
    // cleanup so the remount doesn't stack a second listener.
    const { unmount } = renderHook(() => useAuthHandler(), {
      wrapper: makeWrapper(store),
    });
    await flushMicrotasks();
    unmount();
    expect(capturedRemoveExpiring.mock.calls.length).toBeGreaterThanOrEqual(1);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    // Adds minus removes = live listeners; must be exactly 1 after remount.
    const netLive =
      capturedAddExpiring.mock.calls.length -
      capturedRemoveExpiring.mock.calls.length;
    expect(netLive).toBe(1);

    await act(async () => {
      await capturedExpiringHandler?.();
    });
    expect(mockSigninSilent).toHaveBeenCalledTimes(1);
  });

  it("drops A's late-resolving handleLogin when B has already taken over", async () => {
    // Switch A -> B while A's handleLogin still awaits getUser(). Without the
    // stale-login guard, A's late resolution would leak its listener.
    let resolveAGetUser: (u: any) => void = () => {};
    let resolveBGetUser: (u: any) => void = () => {};
    mockGetUser
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveAGetUser = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveBGetUser = resolve;
          }),
      );

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);
    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });

    act(() => {
      store.set(clusterAtom, makeOidcCluster('bar') as any);
    });

    // A resolves late, then B.
    resolveAGetUser({
      expired: false,
      id_token: 'A-token',
      access_token: 'A',
    });
    resolveBGetUser({
      expired: false,
      id_token: 'B-token',
      access_token: 'B',
    });
    await flushMicrotasks();
    await flushMicrotasks();

    // Net live listeners = adds - removes; must be exactly 1 (B's).
    const netLive =
      capturedAddExpiring.mock.calls.length -
      capturedRemoveExpiring.mock.calls.length;
    expect(netLive).toBe(1);

    expect(store.get(authDataAtom)).toEqual({ token: 'B-token' });
  });
});
