import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createStore, Provider } from 'jotai';
import { createElement, PropsWithChildren } from 'react';
import { authDataAtom } from '../authDataAtom';
import { clusterAtom } from '../clusterAtom';
import {
  saveIntendedPath,
  getIntendedPath,
  clearIntendedPath,
} from '../intendedPathAtom';
import { useIntendedPathRestore } from '../useIntendedPathRestore';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const cluster = {
  name: 'foo',
  contextName: 'foo',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

function makeWrapper(store: ReturnType<typeof createStore>) {
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      null,
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

describe('useIntendedPathRestore', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    sessionStorage.clear();
    localStorage.clear();
  });

  it('navigates to intended path once auth is restored', () => {
    const store = createStore();
    store.set(clusterAtom, cluster);
    saveIntendedPath('/namespaces/bar');

    renderHook(() => useIntendedPathRestore(), {
      wrapper: makeWrapper(store),
    });

    // Auth transitions from null to a value.
    act(() => {
      store.set(authDataAtom, { token: 'x' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/namespaces/bar');
    // Intended path was consumed.
    expect(getIntendedPath()).toBeNull();
  });

  it('fires a second time in the same tab when a new intended path is written', () => {
    const store = createStore();
    store.set(clusterAtom, cluster);
    saveIntendedPath('/namespaces/first');

    renderHook(() => useIntendedPathRestore(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      store.set(authDataAtom, { token: 'x' });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/namespaces/first');

    // Simulate a session drop -> re-auth cycle:
    // auth cleared, intended path saved again, auth restored.
    mockNavigate.mockReset();
    act(() => {
      store.set(authDataAtom, null);
    });
    saveIntendedPath('/namespaces/second');
    act(() => {
      store.set(authDataAtom, { token: 'y' });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/cluster/foo/namespaces/second');
  });

  it('does nothing when there is no intended path', () => {
    const store = createStore();
    store.set(clusterAtom, cluster);
    clearIntendedPath();

    renderHook(() => useIntendedPathRestore(), {
      wrapper: makeWrapper(store),
    });

    act(() => {
      store.set(authDataAtom, { token: 'x' });
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
