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

  it('redirects once and counts it when the stored user has expired', async () => {
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

  it('releases the claim when the redirect fails, even after a cluster switch', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    managerMock.getUser.mockResolvedValue({ expired: true });
    let rejectRedirect: (e: Error) => void = () => {};
    managerMock.signinRedirect.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectRedirect = reject;
        }),
    );
    const { Wrapper, store } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });
    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
    );

    // The cluster switch makes the later failure belong to a superseded login.
    act(() => store.set(clusterAtom, { ...OIDC_CLUSTER, name: 'bar' } as any));
    rejectRedirect(new Error('idp down'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(tryClaimReauthRedirect()).toBe(true);
  });

  it('does not redirect again while another redirect is under way', async () => {
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
    // Three recent redirects make the next login stop and show the dialog.
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    managerMock.getUser.mockResolvedValue({ expired: true });
    window.history.replaceState({}, '', '/cluster/foo/namespaces/bar');

    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    // Nothing saved yet: closing the dialog must not leave a path for the next cluster.
    expect(getIntendedPath()).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    expect(options?.onRetry).toBeDefined();
    await options.onRetry();
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
    expect(managerMock.signinRedirect).toHaveBeenCalledWith({
      prompt: 'login',
    });
  });

  it('Retry stores the cluster name so the login callback can restore the cluster', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    managerMock.getUser.mockResolvedValue({ expired: true });
    window.history.replaceState({}, '', '/cluster/foo/namespaces/bar');

    const { Wrapper } = makeWrapper();
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    // The stopped login cleared the cluster.
    expect(localStorage.getItem(CLUSTER_NAME_STORAGE_KEY)).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    await options.onRetry();

    expect(localStorage.getItem(CLUSTER_NAME_STORAGE_KEY)).toBe('foo');
  });

  it('Retry keeps the kubeconfigID of a pending deep link on the saved path', async () => {
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

    // After login the cluster's configuration is loaded and replaces the atom's value.
    act(() =>
      store.set(configurationAtom, {
        features: { SSO_LOGIN: { isEnabled: false } },
      } as any),
    );

    expect(cleanup).not.toHaveBeenCalled();
    expect(authUserManagerRef.current).toBe(managerMock);
    expect(attachSilentRenewHandlers).toHaveBeenCalledTimes(1);
  });

  it('finishes a new login even if the old token is still valid', async () => {
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

  it('keeps the stored user when the callback in the URL is stale', async () => {
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
