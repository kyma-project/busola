import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from '../configuration/configurationAtom';
import { clusterAtom } from '../clusterAtom';
import { useAuthHandler } from '../authDataAtom';
import {
  getIntendedPath,
  saveIntendedPath,
  savePendingKubeconfigId,
  consumePendingKubeconfigId,
} from '../intendedPathAtom';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  isReauthRedirectPending,
  registerAuthRedirect,
  resetReauthRedirectClaim,
} from '../utils/authRedirectLoopGuard';
import { ssoDataAtom, useSSOLogin } from '../ssoDataAtom';

// The SSO module attaches its handlers only once, so keep them across tests.
const { managerMock, notifyLoginFailureMock, handlers } = vi.hoisted(() => {
  const handlers: {
    onRenewError?: (error: Error) => void;
    onUserUnloaded?: () => void;
    renew: ReturnType<typeof vi.fn>;
  } = { renew: vi.fn() };
  return {
    handlers,
    managerMock: {
      getUser: vi.fn(),
      signinRedirect: vi.fn().mockResolvedValue(undefined),
      signinRedirectCallback: vi.fn(),
      clearStaleState: vi.fn().mockResolvedValue(undefined),
      events: {
        addUserUnloaded: vi.fn((callback: () => void) => {
          handlers.onUserUnloaded = callback;
        }),
      },
    },
    notifyLoginFailureMock: vi.fn(),
  };
});

vi.mock('oidc-client-ts', () => ({
  UserManager: class {
    constructor() {
      return managerMock;
    }
  },
  User: class {},
}));

vi.mock('../silentRenewSetup', () => ({
  attachSilentRenewHandlers: vi.fn(
    (_manager: unknown, options: { onRenewError: (error: Error) => void }) => {
      handlers.onRenewError = options.onRenewError;
      return { cleanup: vi.fn(), renew: handlers.renew };
    },
  ),
}));

vi.mock('../useLoginFailureNotification', () => ({
  useNotifyLoginFailure: () => notifyLoginFailureMock,
}));

vi.mock('shared/utils/env', async () => {
  const actual =
    await vi.importActual<typeof import('shared/utils/env')>(
      'shared/utils/env',
    );
  return { ...actual, getEnv: vi.fn().mockResolvedValue(undefined) };
});

const SSO_CONFIG = {
  isEnabled: true,
  config: { issuerUrl: 'https://idp.example', clientId: 'sso-client' },
};

function makeWrapper() {
  const store = createStore();
  store.set(configurationAtom, { features: { SSO_LOGIN: SSO_CONFIG } } as any);
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      null,
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return { Wrapper, store };
}

const liveUser = () => ({
  id_token: 'live',
  expires_at: Math.floor(Date.now() / 1000) + 600,
});

const jwtWithExp = (exp: number) =>
  `${btoa('{"alg":"none"}')}.${btoa(JSON.stringify({ exp }))}.sig`;

describe('useSSOLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    managerMock.getUser.mockResolvedValue(null);
    resetReauthRedirectClaim();
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });
  });

  // Fresh module per test: it attaches its handlers only once.
  describe('with a live stored token', () => {
    const load = async () => {
      vi.resetModules();
      const sso = await import('../ssoDataAtom');
      const { configurationAtom: config } =
        await import('../configuration/configurationAtom');
      const { attachSilentRenewHandlers: attach } =
        await import('../silentRenewSetup');
      const { getEnv: env } = await import('shared/utils/env');
      const store = createStore();
      store.set(config, { features: { SSO_LOGIN: SSO_CONFIG } } as any);
      const Wrapper = ({ children }: PropsWithChildren) =>
        createElement(
          MemoryRouter,
          null,
          createElement(Provider, { store }, children),
        );
      Wrapper.displayName = 'TestWrapper';
      return { ...sso, attach, env, store, Wrapper };
    };

    it('does nothing when the login is bypassed', async () => {
      const m = await load();
      const user = liveUser();
      sessionStorage.setItem('SSO', JSON.stringify(user));
      vi.mocked(m.env).mockResolvedValueOnce('true');
      m.store.set(m.ssoDataAtom, user as never);

      renderHook(() => m.useSSOLogin(), { wrapper: m.Wrapper });
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(managerMock.getUser).not.toHaveBeenCalled();
      expect(m.attach).not.toHaveBeenCalled();
    });

    it('leaves the token alone when the library has no user to renew with', async () => {
      const m = await load();
      const user = liveUser();
      sessionStorage.setItem('SSO', JSON.stringify(user));
      m.store.set(m.ssoDataAtom, user as never);

      renderHook(() => m.useSSOLogin(), { wrapper: m.Wrapper });

      await waitFor(() => expect(managerMock.getUser).toHaveBeenCalledTimes(1));
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(m.attach).not.toHaveBeenCalled();
      expect(managerMock.signinRedirect).not.toHaveBeenCalled();
      expect(m.store.get(m.ssoDataAtom)?.id_token).toBe('live');
    });

    it('attaches the renew handlers without a login and renews in the background', async () => {
      const m = await load();
      const user = liveUser();
      sessionStorage.setItem('SSO', JSON.stringify(user));
      managerMock.getUser.mockResolvedValue({ ...user, expired: false });
      handlers.renew.mockResolvedValue({ ...user, id_token: 'renewed' });
      // A resume is not a login, so a counted redirect must survive.
      registerAuthRedirect();
      m.store.set(m.ssoDataAtom, user as never);

      renderHook(() => m.useSSOLogin(), { wrapper: m.Wrapper });

      await waitFor(() => expect(m.attach).toHaveBeenCalledTimes(1));
      expect(managerMock.signinRedirect).not.toHaveBeenCalled();
      expect(managerMock.signinRedirectCallback).not.toHaveBeenCalled();
      expect(
        JSON.parse(sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY) || '[]'),
      ).toHaveLength(1);
      expect(m.store.get(m.ssoDataAtom)?.id_token).toBe('live');

      // The fetch layer's expiry check, which used to reload the page.
      m.checkForTokenExpiration(jwtWithExp(Math.floor(Date.now() / 1000) + 10));

      await waitFor(() => expect(handlers.renew).toHaveBeenCalledTimes(1));
      expect(managerMock.signinRedirect).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('SSO')).toBe(JSON.stringify(user));
    });
  });

  it('stops and reports when the IdP returns an error callback', async () => {
    window.history.replaceState(
      {},
      '',
      '/?error=access_denied&error_description=provisioning+mismatch&state=s1',
    );
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    expect(notifyLoginFailureMock.mock.calls[0][0]).toEqual({
      error: 'access_denied',
      errorDescription: 'provisioning mismatch',
      fromIdp: true,
    });
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
  });

  it('stops and reports instead of redirecting again when a loop is detected', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    expect(notifyLoginFailureMock.mock.calls[0][0]).toBeUndefined();
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
  });

  it('redirects to the IdP when there is no callback and no loop', async () => {
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
    );
    expect(notifyLoginFailureMock).not.toHaveBeenCalled();
    // One legitimate redirect does not trip the guard.
    expect(isAuthRedirectLoop()).toBe(false);
  });

  it('resets the loop guard after a successful login', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    managerMock.getUser.mockResolvedValue({
      expired: false,
      id_token: 'jwt',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const { Wrapper, store } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(store.get(ssoDataAtom)?.id_token).toBe('jwt'));
    expect(isAuthRedirectLoop()).toBe(false);
    expect(notifyLoginFailureMock).not.toHaveBeenCalled();
  });

  it('redirects only once when one expiry fires several handlers', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    managerMock.getUser.mockResolvedValue({
      expired: false,
      id_token: 'jwt',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const { Wrapper, store } = makeWrapper();
    renderHook(() => useSSOLogin(), { wrapper: Wrapper });
    await waitFor(() => expect(store.get(ssoDataAtom)?.id_token).toBe('jwt'));
    expect(handlers.onRenewError).toBeDefined();
    expect(handlers.onUserUnloaded).toBeDefined();

    handlers.onRenewError!(new Error('invalid_grant'));
    handlers.onUserUnloaded!();

    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
    );
    await Promise.resolve();
    expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY) || '[]'),
    ).toHaveLength(1);
  });

  it('Retry forces a fresh login and saves the path', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    window.history.replaceState({}, '', '/cluster/foo/namespaces/bar');
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());

    // By the time Retry is clicked the app has navigated to the cluster list.
    window.history.replaceState({}, '', '/clusters');
    expect(getIntendedPath()).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    expect(options?.onRetry).toBeDefined();
    await options.onRetry();

    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledWith({
        prompt: 'login',
      }),
    );
    expect(isReauthRedirectPending()).toBe(true);
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
  });

  it('drops the saved return target on Close and brings it back on Retry', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    saveIntendedPath('/namespaces/bar', 'my.yaml');
    savePendingKubeconfigId('my.yaml');
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    expect(getIntendedPath()).toBeNull();
    expect(consumePendingKubeconfigId()).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    await options.onRetry();
    expect(getIntendedPath()).toMatchObject({
      path: '/namespaces/bar',
      kubeconfigId: 'my.yaml',
    });
    expect(consumePendingKubeconfigId()).toBe('my.yaml');
  });

  it('saves the kubeconfigID before the SSO redirect', async () => {
    window.history.replaceState({}, '', '/clusters?kubeconfigID=my.yaml');
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
    );
    expect(consumePendingKubeconfigId()).toBe('my.yaml');
  });

  it('puts the saved kubeconfigID back into the URL after the SSO login', async () => {
    savePendingKubeconfigId('my.yaml');
    // Marks the callback as belonging to the SSO client.
    localStorage.setItem(
      'oidc.s1',
      JSON.stringify({ client_id: 'sso-client' }),
    );
    window.history.replaceState({}, '', '/?code=abc&state=s1');
    managerMock.getUser.mockResolvedValue(null);
    managerMock.signinRedirectCallback.mockResolvedValue({
      expired: false,
      id_token: 'jwt',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(window.location.search).toContain('kubeconfigID=my.yaml'),
    );
    expect(window.location.search).not.toContain('code=');
    expect(consumePendingKubeconfigId()).toBeNull();
  });

  it('finishes a new SSO login even if the old SSO token is still valid', async () => {
    localStorage.setItem(
      'oidc.s1',
      JSON.stringify({ client_id: 'sso-client' }),
    );
    window.history.replaceState({}, '', '/?code=abc&state=s1');
    managerMock.getUser.mockResolvedValue({
      expired: false,
      id_token: 'old-jwt',
      expires_at: Math.floor(Date.now() / 1000) + 20,
    });
    managerMock.signinRedirectCallback.mockResolvedValue({
      expired: false,
      id_token: 'fresh-jwt',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const { Wrapper, store } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(store.get(ssoDataAtom)?.id_token).toBe('fresh-jwt'),
    );
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
  });

  it('removes the callback parameters from the URL after the SSO login', async () => {
    localStorage.setItem(
      'oidc.s1',
      JSON.stringify({ client_id: 'sso-client' }),
    );
    window.history.replaceState(
      {},
      '',
      '/?code=abc&state=s1&session_state=x&iss=https%3A%2F%2Fidp.example',
    );
    managerMock.signinRedirectCallback.mockResolvedValue({
      expired: false,
      id_token: 'jwt',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const { Wrapper, store } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(store.get(ssoDataAtom)?.id_token).toBe('jwt'));
    // Otherwise the cluster login mistakes them for a foreign callback.
    expect(window.location.search).toBe('');
  });

  // With SSO enabled the cluster login waits for an SSO session, so the SSO
  // login must get one whichever callback the page loads with.
  describe('before the cluster login', () => {
    const oidcCluster = {
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
    } as never;
    const renderBothLogins = () => {
      const { Wrapper, store } = makeWrapper();
      store.set(clusterAtom, oidcCluster);
      renderHook(
        () => {
          useSSOLogin();
          useAuthHandler();
        },
        { wrapper: Wrapper },
      );
      return store;
    };

    it('starts the SSO login when a cluster callback arrives with an expired SSO token', async () => {
      sessionStorage.setItem(
        'SSO',
        JSON.stringify({
          id_token: 'old',
          expires_at: Math.floor(Date.now() / 1000) - 10,
        }),
      );
      localStorage.setItem(
        'oidc.s1',
        JSON.stringify({ client_id: 'cluster-client' }),
      );
      window.history.replaceState({}, '', '/?code=abc&state=s1');

      renderBothLogins();

      await waitFor(() =>
        expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
      );
      // The cluster login restarts after the SSO login; its code is left alone.
      expect(managerMock.signinRedirectCallback).not.toHaveBeenCalled();
    });

    it('stops instead of redirecting when a cluster callback arrives during a loop', async () => {
      registerAuthRedirect();
      registerAuthRedirect();
      registerAuthRedirect();
      localStorage.setItem(
        'oidc.s1',
        JSON.stringify({ client_id: 'cluster-client' }),
      );
      window.history.replaceState({}, '', '/?code=abc&state=s1');

      renderBothLogins();

      await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
      expect(managerMock.signinRedirect).not.toHaveBeenCalled();
    });

    it('starts the cluster login after the SSO callback', async () => {
      localStorage.setItem(
        'oidc.s1',
        JSON.stringify({ client_id: 'sso-client' }),
      );
      window.history.replaceState({}, '', '/?code=abc&state=s1');
      managerMock.signinRedirectCallback.mockResolvedValue({
        expired: false,
        id_token: 'jwt',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      });

      const store = renderBothLogins();

      await waitFor(() => expect(store.get(ssoDataAtom)?.id_token).toBe('jwt'));
      await waitFor(() =>
        expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
      );
      expect(managerMock.signinRedirectCallback).toHaveBeenCalledTimes(1);
    });

    it('restarts the SSO login when a cluster is opened after a stopped login', async () => {
      registerAuthRedirect();
      registerAuthRedirect();
      registerAuthRedirect();

      const store = renderBothLogins();

      await waitFor(() =>
        expect(notifyLoginFailureMock).toHaveBeenCalledTimes(1),
      );
      expect(store.get(clusterAtom)).toBeNull();
      expect(managerMock.signinRedirect).not.toHaveBeenCalled();

      act(() => store.set(clusterAtom, oidcCluster));

      await waitFor(() =>
        expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
      );
      // Plain redirect, unlike Retry; the one getUser is the SSO login's, so no cluster login ran.
      expect(managerMock.signinRedirect).toHaveBeenCalledWith();
      expect(managerMock.getUser).toHaveBeenCalledTimes(1);
      expect(managerMock.signinRedirectCallback).not.toHaveBeenCalled();
    });
  });
});

describe('ssoDataAtom initial value', () => {
  const load = async () => {
    vi.resetModules();
    const { createStore: freshStore } = await import('jotai');
    const { ssoDataAtom: freshAtom } = await import('../ssoDataAtom');
    return freshStore().get(freshAtom);
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('ignores an expired stored SSO token', async () => {
    sessionStorage.setItem(
      'SSO',
      JSON.stringify({
        id_token: 'old',
        expires_at: Math.floor(Date.now() / 1000) - 10,
      }),
    );
    expect(await load()).toBeNull();
  });

  it('keeps a valid stored SSO token', async () => {
    sessionStorage.setItem(
      'SSO',
      JSON.stringify({
        id_token: 'live',
        expires_at: Math.floor(Date.now() / 1000) + 600,
      }),
    );
    expect((await load())?.id_token).toBe('live');
  });
});
