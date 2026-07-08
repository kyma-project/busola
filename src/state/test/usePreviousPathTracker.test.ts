import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router';
import { createElement, PropsWithChildren } from 'react';
import { usePreviousPathTracker, getPreviousPath } from '../useAfterInitHook';

const PREVIOUS_PATHNAME_KEY = 'busola.previous-pathname';

function makeWrapper(initialEntries: string[]) {
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(MemoryRouter, { initialEntries }, children);
  Wrapper.displayName = 'MemoryRouterWrapper';
  return Wrapper;
}

describe('usePreviousPathTracker', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes the current pathname to storage on mount', () => {
    renderHook(() => usePreviousPathTracker(), {
      wrapper: makeWrapper(['/cluster/foo/namespaces/bar']),
    });
    expect(getPreviousPath()).toBe('/cluster/foo/namespaces/bar');
  });

  it('updates the stored path when the user navigates', () => {
    const { result } = renderHook(
      () => {
        usePreviousPathTracker();
        return useNavigate();
      },
      { wrapper: makeWrapper(['/cluster/foo']) },
    );

    act(() => {
      result.current('/cluster/foo/namespaces/qux/deployments');
    });

    expect(localStorage.getItem(PREVIOUS_PATHNAME_KEY)).toBe(
      '/cluster/foo/namespaces/qux/deployments',
    );
  });

  it('does not overwrite storage when path is /clusters', () => {
    localStorage.setItem(PREVIOUS_PATHNAME_KEY, '/cluster/foo/overview');
    renderHook(() => usePreviousPathTracker(), {
      wrapper: makeWrapper(['/clusters']),
    });
    expect(getPreviousPath()).toBe('/cluster/foo/overview');
  });
});
