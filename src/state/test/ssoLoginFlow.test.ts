import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from '../configuration/configurationAtom';
import {
  getIntendedPath,
  savePendingKubeconfigId,
  consumePendingKubeconfigId,
} from '../intendedPathAtom';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetReauthRedirectClaim,
} from '../utils/authRedirectLoopGuard';
import { ssoDataAtom, useSSOLogin } from '../ssoDataAtom';

// The SSO module attaches its handlers once per module, so keep them across tests.
const { managerMock, notifyLoginFailureMock, handlers } = vi.hoisted(() => {
  const handlers: {
    onRenewError?: (error: Error) => void;
    onUserUnloaded?: () => void;
  } = {};
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
      return { cleanup: vi.fn(), renew: vi.fn() };
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

  it('redirects and counts once when one expiry fires several handlers', async () => {
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

  it('onRetry for loop-stop forces prompt=login and restores the path', async () => {
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
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
  });

  it('saves the kubeconfigID before redirecting so a deep link survives SSO', async () => {
    window.history.replaceState({}, '', '/clusters?kubeconfigID=my.yaml');
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(managerMock.signinRedirect).toHaveBeenCalledTimes(1),
    );
    // The pending ID is stored so the post-redirect callback can restore it.
    expect(consumePendingKubeconfigId()).toBe('my.yaml');
  });

  it('restores the saved kubeconfigID into the URL after the SSO callback', async () => {
    savePendingKubeconfigId('my.yaml');
    // Owner lookup for the callback state must resolve to the SSO client.
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
    // Callback params are stripped and the pending ID was consumed.
    expect(window.location.search).not.toContain('code=');
    expect(consumePendingKubeconfigId()).toBeNull();
  });

  it('processes a login callback even while the previous SSO token is still valid', async () => {
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
});
