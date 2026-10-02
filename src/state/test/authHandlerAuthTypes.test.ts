import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from '../configuration/configurationAtom';
import { clusterAtom } from '../clusterAtom';
import { resetReauthRedirectClaim } from '../utils/authRedirectLoopGuard';
import { authDataAtom, useAuthHandler } from '../authDataAtom';

// Characterization of the auth-type dispatch in useAuthHandler. The recovery
// code the #5307 fixes touch (handleLogin / onLoginFailed / prompt:login) only
// runs for OIDC clusters. These tests pin that boundary: token, client-cert
// and generic-exec clusters must never construct or touch a UserManager, so a
// future edit to the OIDC path cannot silently affect them. getUser being
// called is the marker that handleLogin (the UserManager path) was entered.

const mockNavigate = vi.fn();

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

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeWrapper(user: unknown) {
  const store = createStore();
  store.set(configurationAtom, {
    features: { SSO_LOGIN: { isEnabled: false } },
  } as never);
  store.set(clusterAtom, {
    name: 'foo',
    currentContext: { namespace: 'bar', user: { user } },
  } as never);
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/cluster/foo/namespaces/bar'] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return { Wrapper, store };
}

describe('useAuthHandler auth-type dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    window.history.replaceState({}, '', '/');
    resetReauthRedirectClaim();
  });

  it('a token cluster logs in directly without touching a UserManager', async () => {
    const { Wrapper, store } = makeWrapper({ token: 'abc' });
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(store.get(authDataAtom)).toEqual({ token: 'abc' }),
    );
    expect(managerMock.getUser).not.toHaveBeenCalled();
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
    expect(notifyLoginFailureMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('a client-certificate cluster logs in directly without touching a UserManager', async () => {
    const credentials = {
      'client-certificate-data': 'cert',
      'client-key-data': 'key',
    };
    const { Wrapper, store } = makeWrapper(credentials);
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(store.get(authDataAtom)).toEqual(credentials));
    expect(managerMock.getUser).not.toHaveBeenCalled();
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
    expect(notifyLoginFailureMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('a generic exec cluster is sent to the cluster list, not through the IdP', async () => {
    const { Wrapper, store } = makeWrapper({ exec: { args: ['--not-oidc'] } });
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/clusters'));
    expect(managerMock.getUser).not.toHaveBeenCalled();
    expect(managerMock.signinRedirect).not.toHaveBeenCalled();
    expect(notifyLoginFailureMock).not.toHaveBeenCalled();
    expect(store.get(authDataAtom)).toBeNull();
  });

  it('an OIDC cluster does go through the UserManager (boundary contrast)', async () => {
    managerMock.getUser.mockResolvedValue({
      expired: false,
      id_token: 'jwt',
      access_token: 'access',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });
    const { Wrapper, store } = makeWrapper({
      exec: {
        args: [
          '--oidc-issuer-url=https://idp.example',
          '--oidc-client-id=cluster-client',
        ],
      },
    });
    renderHook(() => useAuthHandler(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(store.get(authDataAtom)).toEqual({ token: 'jwt' }),
    );
    expect(managerMock.getUser).toHaveBeenCalled();
  });
});
