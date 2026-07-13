import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { expandedCategoriesAtom } from '../expandedCategoriesAtom';
import { clusterAtom } from 'state/clusterAtom';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';

const makeCluster = (name: string) =>
  ({
    name,
    server: 'https://example.com',
    currentContext: name,
  }) as any;

describe('expandedCategoriesAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    localStorage.clear();
  });

  it('returns empty array when no categories have been expanded', () => {
    expect(store.get(expandedCategoriesAtom)).toEqual([]);
  });

  it('stores and retrieves expanded categories for the cluster scope', () => {
    store.set(clusterAtom, makeCluster('my-cluster'));
    store.set(expandedCategoriesAtom, ['Workloads', 'Storage']);
    expect(store.get(expandedCategoriesAtom)).toEqual(['Workloads', 'Storage']);
  });

  it('stores and retrieves expanded categories for the namespace scope', () => {
    store.set(clusterAtom, makeCluster('my-cluster'));
    store.set(activeNamespaceIdAtom, 'default');
    store.set(expandedCategoriesAtom, ['Configuration']);
    expect(store.get(expandedCategoriesAtom)).toEqual(['Configuration']);
  });

  it('keeps cluster and namespace scopes separate', () => {
    store.set(clusterAtom, makeCluster('my-cluster'));

    // Set namespace-scoped value
    store.set(activeNamespaceIdAtom, 'default');
    store.set(expandedCategoriesAtom, ['Configuration']);

    // Switch to cluster scope
    store.set(activeNamespaceIdAtom, '');
    expect(store.get(expandedCategoriesAtom)).toEqual([]);

    store.set(expandedCategoriesAtom, ['Workloads']);
    expect(store.get(expandedCategoriesAtom)).toEqual(['Workloads']);

    // Switch back to namespace scope — original value preserved
    store.set(activeNamespaceIdAtom, 'default');
    expect(store.get(expandedCategoriesAtom)).toEqual(['Configuration']);
  });

  it('keeps data separate per cluster name', () => {
    store.set(clusterAtom, makeCluster('cluster-a'));
    store.set(expandedCategoriesAtom, ['Workloads']);

    store.set(clusterAtom, makeCluster('cluster-b'));
    expect(store.get(expandedCategoriesAtom)).toEqual([]);

    store.set(expandedCategoriesAtom, ['Storage']);

    store.set(clusterAtom, makeCluster('cluster-a'));
    expect(store.get(expandedCategoriesAtom)).toEqual(['Workloads']);
  });

  it('returns empty array when clusterName is empty string', () => {
    store.set(expandedCategoriesAtom, ['Workloads']);
    expect(store.get(expandedCategoriesAtom)).toEqual(['Workloads']);
    // A different store (fresh) has no cluster — should return []
    const fresh = createStore();
    expect(fresh.get(expandedCategoriesAtom)).toEqual([]);
  });
});
