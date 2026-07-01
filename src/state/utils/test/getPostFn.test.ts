import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';

vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  createFetchFn: vi.fn(),
}));

vi.mock('shared/hooks/BackendAPI/usePost', () => ({
  createPostFn: vi.fn(),
}));

const { getPostFn } = await import('../getPostFn');
const { createFetchFn } = await import('shared/hooks/BackendAPI/useFetch');
const { createPostFn } = await import('shared/hooks/BackendAPI/usePost');

const mockCreateFetchFn = vi.mocked(createFetchFn);
const mockCreatePostFn = vi.mocked(createPostFn);
const mockFetchFn = vi.fn();
const mockPostFn = vi.fn();

const cluster = {
  name: 'test-cluster',
  contextName: 'test-cluster',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

const authData = { token: 'my-token' };

describe('getPostFn', () => {
  beforeEach(() => {
    mockCreateFetchFn.mockClear();
    mockCreateFetchFn.mockReturnValue(mockFetchFn);
    mockCreatePostFn.mockClear();
    mockCreatePostFn.mockReturnValue(mockPostFn);
  });

  it('returns null when authData is null', () => {
    const store = createStore();
    store.set(authDataAtom, null);
    store.set(clusterAtom, cluster);

    expect(getPostFn(store.get)).toBeNull();
  });

  it('returns null when cluster is null', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, null);

    expect(getPostFn(store.get)).toBeNull();
  });

  it('returns a post function when authData and cluster are set', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);

    expect(getPostFn(store.get)).toBe(mockPostFn);
  });

  it('builds the post function from the fetch function', () => {
    const store = createStore();
    store.set(authDataAtom, authData);
    store.set(clusterAtom, cluster);

    getPostFn(store.get);

    expect(mockCreatePostFn).toHaveBeenCalledWith(mockFetchFn);
  });
});
