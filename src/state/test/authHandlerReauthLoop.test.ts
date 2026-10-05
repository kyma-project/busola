import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from '../configuration/configurationAtom';
import { clusterAtom, CLUSTER_NAME_STORAGE_KEY } from '../clusterAtom';
import { getIntendedPath, saveIntendedPath } from '../intendedPathAtom';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetReauthRedirectClaim,
  tryClaimReauthRedirect,
} from '../utils/authRedirectLoopGuard';
import {
  authDataAtom,
  authUserManagerRef,
  useAuthHandler,
} from '../authDataAtom';
import { attachSilentRenewHandlers } from '../silentRenewSetup';

const { managerMock, notifyLoginFailureMock } = vi.hoisted(() => ({
  managerMock: {
    getUser: vi.fn(),
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    signinRedirectCallback: vi.fn(),
    clearStaleState: vi.fn().mockResolvedValue(undefined),
    events: { addAccessTokenExpiring: vi.fn(), addUserUnloaded: vi.fn() },
  },
  notifyLoginFailureMock: vi.fn(),
}));

vi.mock('oidc-client-ts', () => ({
  UserManager: class {
    constructor() {
      return managerMock;
    }
  },
  User: class {},
}));

vi.mock('../silentRenewSetup', () => ({
  attachSilentRenewHandlers: vi.fn(() => ({ cleanup: vi.fn() })),
}));

vi.mock('../useLoginFailureNotification', () => ({
  useNotifyLoginFailure: () => notifyLoginFailureMock,
}));

const OIDC_CLUSTER = {
  name: 'foo',
  currentContext: {
    namespace: 'bar',
    user: {
      user: {
        exec: {
          args: [
            '--oidc-issuer-url=https://idp.example',
            '--oidc-client-id=cluster-client',
          ],
        },
      },
    },
  },
};

function makeWrapper() {
  const store = createStore();
  store.set(configurationAtom, {
    features: { SSO_LOGIN: { isEnabled: false } },
  } as any);
  store.set(clusterAtom, OIDC_CLUSTER as any);
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/cluster/foo/namespaces/bar'] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return { Wrapper, store };
}

describe('useAuthHandler redirect-loop guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    resetReauthRedirectClaim();
    managerMock.getUser.mockResolvedValue({
      expired: false,
      id_token: 'jwt',
      access_token: 'access',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
  });

  it('a successful login does not clear a redirect loop already in progress', async () => {
    // A loop is already running (IdP accepts the token, API server rejects it).
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(true);

    const { Wrapper, store } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(store.get(authDataAtom)).toEqual({ token: 'jwt' }),
    );

    // If the guard was cleared here the counter would reset every cycle and
    // we would loop forever, the next reauth still needs to see it.
    expect(isAuthRedirectLoop()).toBe(true);
  });

  it('redirects and counts once for an expired stored user', async () => {
    managerMock.getUser.mockResolvedValue({ expired: true });
    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
    );
    expect(
      JSON.parse(sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY) || '[]'),
    ).toHaveLength(1);
  });

  it('does not redirect or count again while another handler holds the claim', async () => {
    tryClaimReauthRedirect();
    managerMock.getUser.mockResolvedValue({ expired: true });
    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(managerMock.getUser).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
    expect(sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY)).toBeNull();
  });

  it('Retry saves the path and forces a fresh login', async () => {
    // Pre-trip the guard so handleLogin's stop-loop path fires onLoginFailed.
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    managerMock.getUser.mockResolvedValue({ expired: true });
    // handleLogin reads window.location to preserve the user's location.
    window.history.replaceState({}, '', '/cluster/foo/namespaces/bar');

    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    // Nothing is saved while the dialog is open; Close must not leave a path
    // behind for the next cluster.
    expect(getIntendedPath()).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    expect(options?.onRetry).toBeDefined();
    await options.onRetry();
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
    expect(managerMock.signinRedirect).toHaveBeenCalledWith({
      prompt: 'login',
    });
  });

  it('Retry re-persists the cluster so the IdP callback can finish the login', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    managerMock.getUser.mockResolvedValue({ expired: true });
    window.history.replaceState({}, '', '/cluster/foo/namespaces/bar');

    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    // onLoginFailed cleared the cluster, so nothing would restore it on return.
    expect(localStorage.getItem(CLUSTER_NAME_STORAGE_KEY)).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    await options.onRetry();

    // Retry writes the name back so the redirect_uri (origin) load can restore
    // the cluster and exchange the code instead of orphaning the callback.
    expect(localStorage.getItem(CLUSTER_NAME_STORAGE_KEY)).toBe('foo');
  });

  it('Retry keeps the kubeconfigID marker on the saved path', async () => {
    // A kubeconfigID deep-link flow is still pending: its marker must survive.
    saveIntendedPath('/namespaces/other', 'my-kubeconfig');
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    managerMock.getUser.mockResolvedValue({ expired: true });
    window.history.replaceState({}, '', '/cluster/foo/namespaces/bar');

    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    const [, options] = notifyLoginFailureMock.mock.calls[0];
    await options.onRetry();
    expect(getIntendedPath()).toMatchObject({
      path: '/namespaces/bar',
      kubeconfigId: 'my-kubeconfig',
    });
  });

  it('keeps the silent-renew handlers when the configuration reloads after login', async () => {
    const { Wrapper, store } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });
    await waitFor(() => expect(authUserManagerRef.current).toBe(managerMock));
    const { cleanup } = vi.mocked(attachSilentRenewHandlers).mock.results[0]
      .value;

    // The cluster's config is fetched once authenticated and replaces the atom.
    act(() =>
      store.set(configurationAtom, {
        features: { SSO_LOGIN: { isEnabled: false } },
      } as any),
    );

    expect(cleanup).not.toHaveBeenCalled();
    expect(authUserManagerRef.current).toBe(managerMock);
    expect(attachSilentRenewHandlers).toHaveBeenCalledTimes(1);
  });

  it('processes a login callback even while the previous token is still valid', async () => {
    // Re-auth returned before the old token expired; its session cannot renew.
    localStorage.setItem(
      'oidc.s1',
      JSON.stringify({ client_id: 'cluster-client' }),
    );
    window.history.replaceState({}, '', '/?code=abc&state=s1');
    managerMock.signinRedirectCallback.mockResolvedValue({
      expired: false,
      id_token: 'fresh-jwt',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    const { Wrapper, store } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(store.get(authDataAtom)).toEqual({ token: 'fresh-jwt' }),
    );
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
  });

  it('keeps the stored user when a stale callback URL cannot be processed', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(
      'oidc.s1',
      JSON.stringify({ client_id: 'cluster-client' }),
    );
    window.history.replaceState({}, '', '/?code=abc&state=s1');
    managerMock.signinRedirectCallback.mockRejectedValue(
      new Error('No matching state found in storage'),
    );

    const { Wrapper, store } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(store.get(authDataAtom)).toEqual({ token: 'jwt' }),
    );
    expect(notifyLoginFailureMock).not.toHaveBeenCalled();
  });
});
