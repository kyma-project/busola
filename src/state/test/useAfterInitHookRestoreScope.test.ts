import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('components/App/useLoginWithKubeconfigID', () => ({}));

const { useAfterInitHook } = await import('../useAfterInitHook');
const { authDataAtom } = await import('../authDataAtom');
const { clusterAtom } = await import('../clusterAtom');

const cluster = {
  name: 'foo',
  contextName: 'foo',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

function makeWrapper(
  store: ReturnType<typeof createStore>,
  initialEntries: string[],
) {
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

describe('useAfterInitHook previous-path restore scoping', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    localStorage.clear();
    sessionStorage.clear();
    // Make window.location.pathname overridable per test.
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location },
    });
  });

  it('does not hijack an explicit visit to /clusters when previousPath holds a deep URL', () => {
    // Regression from test-edit-cluster.spec.js: the wizard leaves a deep
    // cluster URL in busola.previous-pathname, and a later visit to
    // /clusters got redirected away.
    localStorage.setItem(
      'busola.previous-pathname',
      '/cluster/foo/namespaces/bar',
    );
    Object.defineProperty(window.location, 'pathname', {
      configurable: true,
      value: '/clusters',
    });

    const store = createStore();
    store.set(clusterAtom, cluster);
    store.set(authDataAtom, { token: 'x' });

    renderHook(() => useAfterInitHook('done'), {
      wrapper: makeWrapper(store, ['/clusters']),
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('restores previousPath when landing on the root path (OIDC-callback case)', () => {
    localStorage.setItem(
      'busola.previous-pathname',
      '/cluster/foo/namespaces/bar',
    );
    Object.defineProperty(window.location, 'pathname', {
      configurable: true,
      value: '/',
    });

    const store = createStore();
    store.set(clusterAtom, cluster);
    store.set(authDataAtom, { token: 'x' });

    renderHook(() => useAfterInitHook('done'), {
      wrapper: makeWrapper(store, ['/']),
    });

    expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/namespaces/bar');
    expect(localStorage.getItem('busola.previous-pathname')).toBeNull();
  });

  it('navigates to cluster overview when landing on / without previousPath', () => {
    Object.defineProperty(window.location, 'pathname', {
      configurable: true,
      value: '/',
    });

    const store = createStore();
    store.set(clusterAtom, cluster);
    store.set(authDataAtom, { token: 'x' });

    renderHook(() => useAfterInitHook('done'), {
      wrapper: makeWrapper(store, ['/']),
    });

    expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/overview');
  });

  it('does not navigate at all on /clusters without previousPath', () => {
    Object.defineProperty(window.location, 'pathname', {
      configurable: true,
      value: '/clusters',
    });

    const store = createStore();
    store.set(clusterAtom, cluster);
    store.set(authDataAtom, { token: 'x' });

    renderHook(() => useAfterInitHook('done'), {
      wrapper: makeWrapper(store, ['/clusters']),
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
