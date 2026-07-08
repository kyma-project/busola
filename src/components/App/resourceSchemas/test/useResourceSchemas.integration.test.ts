import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, atom, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';

// -----------------------------------------------------------------------------
// This is the integration test guarding Cause C.2 — `useResourceSchemas` was
// racing the silent-renew path by calling navigate('/clusters') the moment
// an openapi request returned an error, even mid-renew. The fix gates on
// `renewingAtom` and delegates recovery to `useReauthenticate`.
// -----------------------------------------------------------------------------

const mockNotifyError = vi.fn();
const mockReauth = vi.fn();
const mockUseReauthenticate = vi.fn(() => mockReauth);

// Replace the openapi loadable so we can put it into 'hasError' at will.
const openapiTestAtom = atom<any>({ state: 'hasData', data: {} });

vi.mock('state/openapi/openapiAtom', () => ({
  openapiAtom: openapiTestAtom,
}));

vi.mock('state/useReauthenticate', () => ({
  useReauthenticate: mockUseReauthenticate,
}));

vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({ notifyError: mockNotifyError }),
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
