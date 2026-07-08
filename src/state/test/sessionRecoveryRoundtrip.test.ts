import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';

// End-to-end: useAuthHandler + useIntendedPathRestore across a
// renew-fail -> IdP redirect -> restore cycle.

let capturedExpiringHandler: (() => Promise<void>) | null = null;
const mockSigninSilent = vi.fn();
const mockSigninRedirect = vi.fn();
const mockClearStaleState = vi.fn().mockResolvedValue(undefined);
const mockGetUser = vi.fn();
const mockNavigate = vi.fn();

class MockUserManager {
  events = {
    addAccessTokenExpiring: (h: () => Promise<void>) => {
      capturedExpiringHandler = h;
    },
    removeAccessTokenExpiring: vi.fn(),
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

vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({ notifyError: vi.fn() }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const { useAuthHandler, authDataAtom } = await import('../authDataAtom');
const { useIntendedPathRestore } = await import('../useIntendedPathRestore');
const { clusterAtom } = await import('../clusterAtom');
const { getIntendedPath } = await import('../intendedPathAtom');

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
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
}

describe('session-drop recovery round-trip', () => {
  beforeEach(() => {
    mockSigninSilent.mockReset();
    mockSigninRedirect.mockReset();
    mockClearStaleState.mockClear();
    mockGetUser.mockReset();
    mockNavigate.mockReset();
    capturedExpiringHandler = null;
    sessionStorage.clear();
    localStorage.clear();

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  it('after silent renew fails and auth is restored, restore-hook navigates to intended path', async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'initial-token',
      access_token: 'a',
    });
    mockSigninSilent.mockRejectedValue(new Error('invalid_grant'));
    mockSigninRedirect.mockResolvedValue(undefined);

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('foo') as any);

    // Mount both hooks, as App.tsx does.
    renderHook(
      () => {
        useAuthHandler();
        useIntendedPathRestore();
      },
      { wrapper: makeWrapper(store) },
    );
    await flushMicrotasks();

    // Silent renew fails -> reauth path fires.
    await act(async () => {
      await capturedExpiringHandler?.();
    });

    await waitFor(() => {
      expect(mockSigninRedirect).toHaveBeenCalledTimes(1);
    });
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');

    // User returns from the IdP; auth transitions null -> set.
    act(() => {
      store.set(authDataAtom, { token: 'renewed-via-idp' });
    });

    await flushMicrotasks();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/namespaces/bar');
    });
    expect(getIntendedPath()).toBeNull();
  });
});
