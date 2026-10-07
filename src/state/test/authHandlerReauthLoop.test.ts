import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from '../configuration/configurationAtom';
import { clusterAtom } from '../clusterAtom';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetReauthRedirectClaim,
  tryClaimReauthRedirect,
} from '../utils/authRedirectLoopGuard';
import { authDataAtom, useAuthHandler } from '../authDataAtom';

const { managerMock } = vi.hoisted(() => ({
  managerMock: {
    getUser: vi.fn(),
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    signinRedirectCallback: vi.fn(),
    clearStaleState: vi.fn().mockResolvedValue(undefined),
    events: { addAccessTokenExpiring: vi.fn(), addUserUnloaded: vi.fn() },
  },
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

// An OIDC cluster, so the login uses a UserManager instead of a static token.
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
});
