import { renderHook, act } from '@testing-library/react';
import { useContext, createElement, PropsWithChildren } from 'react';
import { describe, it, expect } from 'vitest';
import { VarStoreContext, VarStoreContextProvider } from '../VarStore';

function makeWrapper() {
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(VarStoreContextProvider, null, children);
  Wrapper.displayName = 'VarStoreWrapper';
  return Wrapper;
}

describe('VarStoreContext defaults', () => {
  it('exposes empty vars and callable functions when used without a provider', () => {
    const { result } = renderHook(() => useContext(VarStoreContext));
    expect(result.current.vars).toEqual({});
    expect(typeof result.current.setVar).toBe('function');
    expect(typeof result.current.setVars).toBe('function');
  });
});

describe('VarStoreContextProvider', () => {
  it('starts with empty vars', () => {
    const { result } = renderHook(() => useContext(VarStoreContext), {
      wrapper: makeWrapper(),
    });
    expect(result.current.vars).toEqual({});
  });

  describe('setVar', () => {
    it('adds a new variable by jsonpath', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVar('$.selectedItem', 'pod-1'));

      expect(result.current.vars.selectedItem).toBe('pod-1');
    });

    it('updates an existing variable when the value changes', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVar('$.page', 1));
      act(() => result.current.setVar('$.page', 2));

      expect(result.current.vars.page).toBe(2);
    });

    it('is a no-op when the new value is identical to the current value', () => {
      // Prevents unnecessary re-renders when extensibility configs call setVar
      // on every render with a value that hasn't actually changed.
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVar('$.showDetails', true));
      const snapshotAfterFirstSet = result.current.vars;

      act(() => result.current.setVar('$.showDetails', true));

      expect(result.current.vars).toBe(snapshotAfterFirstSet);
    });

    it('is a no-op when value is undefined', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVar('$.filter', 'active'));
      const snapshotAfterFirstSet = result.current.vars;

      act(() => result.current.setVar('$.filter', undefined));

      expect(result.current.vars).toBe(snapshotAfterFirstSet);
      expect(result.current.vars.filter).toBe('active');
    });

    it('supports nested jsonpath when the intermediate object already exists', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVars({ filters: { namespace: 'default' } }));
      act(() => result.current.setVar('$.filters.namespace', 'kube-system'));

      expect(result.current.vars.filters.namespace).toBe('kube-system');
    });
  });

  describe('setVars', () => {
    it('replaces the entire vars state', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVars({ theme: 'dark', lang: 'en' }));

      expect(result.current.vars).toEqual({ theme: 'dark', lang: 'en' });
    });

    it('supports functional updates to merge new variables', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVars({ nameFilter: '' }));
      act(() =>
        result.current.setVars((prev) => ({ ...prev, nameFilter: 'my-pod' })),
      );

      expect(result.current.vars.nameFilter).toBe('my-pod');
    });

    it('clears previously set variables when given an empty object', () => {
      const { result } = renderHook(() => useContext(VarStoreContext), {
        wrapper: makeWrapper(),
      });

      act(() => result.current.setVars({ foo: 'bar' }));
      act(() => result.current.setVars({}));

      expect(result.current.vars).toEqual({});
    });
  });
});
