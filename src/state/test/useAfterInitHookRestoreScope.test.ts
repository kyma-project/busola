import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';
import { useAfterInitHook } from '../useAfterInitHook';
import { authDataAtom } from '../authDataAtom';
import { clusterAtom } from '../clusterAtom';

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

const cluster = {
  name: 'foo',
  contextName: 'foo',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

function renderOn(pathname: string) {
  Object.defineProperty(window.location, 'pathname', {
    configurable: true,
    value: pathname,
  });

  const store = createStore();
  store.set(clusterAtom, cluster);
  store.set(authDataAtom, { token: 'x' });

  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: [pathname] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';

  renderHook(() => useAfterInitHook('done'), { wrapper: Wrapper });
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
    localStorage.setItem(
      'busola.previous-pathname',
      '/cluster/foo/namespaces/bar',
    );

    renderOn('/clusters');

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('restores previousPath when landing on the root path (OIDC-callback case)', () => {
    localStorage.setItem(
      'busola.previous-pathname',
      '/cluster/foo/namespaces/bar',
    );

    renderOn('/');

    expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/namespaces/bar');
    expect(localStorage.getItem('busola.previous-pathname')).toBeNull();
  });
});
