import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from '../configuration/configurationAtom';
import {
  isAuthRedirectLoop,
  registerAuthRedirect,
} from '../utils/authRedirectLoopGuard';
import { ssoDataAtom, useSSOLogin } from '../ssoDataAtom';

const { managerMock, notifyLoginFailureMock } = vi.hoisted(() => ({
  managerMock: {
    getUser: vi.fn(),
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    signinRedirectCallback: vi.fn(),
    clearStaleState: vi.fn().mockResolvedValue(undefined),
    events: { addUserUnloaded: vi.fn() },
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
  attachSilentRenewHandlers: vi.fn(() => ({
    cleanup: vi.fn(),
    renew: vi.fn(),
  })),
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
    Object.defineProperty(window, 'isSecureContext', {
      configurable: true,
      value: true,
    });
  });

  it('stops and reports instead of redirecting again when a loop is detected', async () => {
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    const { Wrapper } = makeWrapper();

    renderHook(() => useSSOLogin(), { wrapper: Wrapper });

    await waitFor(() => expect(notifyLoginFailureMock).toHaveBeenCalled());
    expect(notifyLoginFailureMock.mock.calls[0][0]).toHaveProperty('onRetry');
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
});
