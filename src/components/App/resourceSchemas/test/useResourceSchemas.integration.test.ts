import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { atom, createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';

// Hoisted so the vi.mock factories below can reference these regardless of
// statement order.
const hoisted = vi.hoisted(() => ({
  mockNotifyError: null as unknown as ReturnType<typeof vi.fn>,
  mockReauth: null as unknown as ReturnType<typeof vi.fn>,
  mockUseReauthenticate: null as unknown as ReturnType<typeof vi.fn>,
  openapiTestAtom: null as unknown as ReturnType<typeof atom>,
}));
hoisted.mockNotifyError = vi.fn();
hoisted.mockReauth = vi.fn();
hoisted.mockUseReauthenticate = vi.fn(() => hoisted.mockReauth);
hoisted.openapiTestAtom = atom<any>({ state: 'hasData', data: {} });
const { mockNotifyError, mockReauth, mockUseReauthenticate, openapiTestAtom } =
  hoisted;

vi.mock('state/openapi/openapiAtom', () => ({
  openapiAtom: hoisted.openapiTestAtom,
}));

vi.mock('state/useReauthenticate', () => ({
  useReauthenticate: hoisted.mockUseReauthenticate,
}));

vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({ notifyError: hoisted.mockNotifyError }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

// The worker API touches Web Workers — stub it out.
vi.mock('components/App/resourceSchemas/resourceSchemaWorkerApi', () => ({
  addWorkerListener: vi.fn(),
  addWorkerErrorListener: vi.fn(),
  sendWorkerMessage: vi.fn(),
  terminateWorker: vi.fn(),
}));

// useUrl reads params off the router; give it what it needs.
vi.mock('hooks/useUrl', () => ({
  useUrl: () => ({ cluster: 'foo' }),
}));

const { useResourceSchemas } = await import('../useResourceSchemas');
const { authDataAtom, authUserManagerRef } = await import('state/authDataAtom');
const { clusterAtom } = await import('state/clusterAtom');
const { renewingAtom } = await import('state/renewingAtom');

function makeCluster(name: string) {
  return {
    name,
    contextName: name,
    kubeconfig: {} as any,
    config: { storage: 'sessionStorage' as const },
    currentContext: { cluster: {}, namespace: '', user: {} } as any,
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

describe('useResourceSchemas openapi-error handling', () => {
  beforeEach(() => {
    mockNotifyError.mockReset();
    mockReauth.mockReset();
    mockUseReauthenticate.mockClear();
    authUserManagerRef.current = { fake: true } as any;
  });

  it('does not trigger reauth on openapi error while a silent renew is in flight', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('foo') as any);
    store.set(authDataAtom, { token: 't' });
    store.set(renewingAtom, true);
    store.set(openapiTestAtom, {
      state: 'hasError',
      error: new Error('401'),
    });

    renderHook(() => useResourceSchemas(), { wrapper: makeWrapper(store) });

    // Give the effect a chance to fire.
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockReauth).not.toHaveBeenCalled();
    expect(mockNotifyError).not.toHaveBeenCalled();
  });

  it('triggers reauth when openapi is in error and no renew is in flight', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('foo') as any);
    store.set(authDataAtom, { token: 't' });
    store.set(renewingAtom, false);
    store.set(openapiTestAtom, {
      state: 'hasError',
      error: new Error('401'),
    });

    renderHook(() => useResourceSchemas(), { wrapper: makeWrapper(store) });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockNotifyError).toHaveBeenCalledTimes(1);
    expect(mockReauth).toHaveBeenCalledTimes(1);
  });

  it('does not call reauth twice if the effect re-runs before navigation', async () => {
    const store = createStore();
    store.set(clusterAtom, makeCluster('foo') as any);
    store.set(authDataAtom, { token: 't' });
    store.set(renewingAtom, false);
    store.set(openapiTestAtom, {
      state: 'hasError',
      error: new Error('401'),
    });

    renderHook(() => useResourceSchemas(), { wrapper: makeWrapper(store) });

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockReauth).toHaveBeenCalledTimes(1);

    // Force the effect to re-run before the browser navigates away.
    act(() => {
      store.set(authDataAtom, { token: 't2' });
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockReauth).toHaveBeenCalledTimes(1);
  });

  it('does not trigger reauth on the /clusters route even without a renew', async () => {
    // Rendered from /clusters via a wrapper override.
    const store = createStore();
    store.set(clusterAtom, makeCluster('foo') as any);
    store.set(authDataAtom, { token: 't' });
    store.set(renewingAtom, false);
    store.set(openapiTestAtom, {
      state: 'hasError',
      error: new Error('401'),
    });

    const Wrapper = ({ children }: PropsWithChildren) =>
      createElement(
        MemoryRouter,
        { initialEntries: ['/clusters'] },
        createElement(Provider, { store }, children),
      );
    Wrapper.displayName = 'ClustersRouteWrapper';

    renderHook(() => useResourceSchemas(), { wrapper: Wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockReauth).not.toHaveBeenCalled();
  });
});
