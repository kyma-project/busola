import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';

let capturedExpiringHandlers: Array<() => Promise<void>> = [];
const mockSigninSilent = vi.fn();
const mockSigninRedirect = vi.fn();
const mockClearStaleState = vi.fn().mockResolvedValue(undefined);
const mockGetUser = vi.fn();

class MockUserManager {
  events = {
    addAccessTokenExpiring: (h: () => Promise<void>) => {
      capturedExpiringHandlers.push(h);
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

const { useAuthHandler, authDataAtom } = await import('../authDataAtom');
const { clusterAtom } = await import('../clusterAtom');

function makeOidcCluster(name: string, clientId: string) {
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
              `--oidc-client-id=${clientId}`,
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
      { initialEntries: ['/cluster/a/namespaces/x'] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

async function flushMicrotasks() {
  for (let i = 0; i < 3; i++) {
    await act(async () => {
      await Promise.resolve();
    });
  }
}

describe('useAuthHandler — stale renew must not clobber the current cluster', () => {
  beforeEach(() => {
    capturedExpiringHandlers = [];
    mockSigninSilent.mockReset();
    mockSigninRedirect.mockReset();
    mockClearStaleState.mockClear();
    mockGetUser.mockReset();
    sessionStorage.clear();
    localStorage.clear();

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  afterEach(() => {
    capturedExpiringHandlers = [];
  });

  it("does not overwrite B's authData when A's signinSilent resolves after switching to B", async () => {
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'A-initial',
      access_token: 'A',
    });

    let resolveARenew: (u: any) => void = () => {};
    mockSigninSilent.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveARenew = resolve;
        }),
    );

    const store = createStore();
    store.set(clusterAtom, makeOidcCluster('a', 'client-a') as any);

    renderHook(() => useAuthHandler(), { wrapper: makeWrapper(store) });
    await flushMicrotasks();

    expect(store.get(authDataAtom)).toEqual({ token: 'A-initial' });

    // Start A's renew; signinSilent stays in flight.
    const handlerA = capturedExpiringHandlers[0];
    const inflightRenew = handlerA?.();
    expect(mockSigninSilent).toHaveBeenCalledTimes(1);

    // Switch to cluster B mid-renew.
    mockGetUser.mockResolvedValue({
      expired: false,
      id_token: 'B-initial',
      access_token: 'B',
    });

    act(() => {
      store.set(clusterAtom, makeOidcCluster('b', 'client-b') as any);
    });
    await flushMicrotasks();

    expect(store.get(authDataAtom)).toEqual({ token: 'B-initial' });

    // A's stale renew resolves late; it must not clobber B's token.
    await act(async () => {
      resolveARenew({ id_token: 'A-renewed', access_token: 'A2' });
      await inflightRenew;
    });

    expect(store.get(authDataAtom)).toEqual({ token: 'B-initial' });
  });
});
