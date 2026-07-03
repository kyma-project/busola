import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';

const clusterA = {
  contextName: 'cluster-a',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

describe('clusterAtom — active cluster state', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('defaults to null when no cluster is stored', () => {
    const store = createStore();
    expect(store.get(clusterAtom)).toBeNull();
  });

  it('can be set to a cluster', () => {
    const store = createStore();
    store.set(clusterAtom, { ...clusterA, name: 'cluster-a' });
    expect(store.get(clusterAtom)).toMatchObject({ name: 'cluster-a' });
  });

  it('can be cleared back to null', () => {
    const store = createStore();
    store.set(clusterAtom, { ...clusterA, name: 'cluster-a' });
    store.set(clusterAtom, null);
    expect(store.get(clusterAtom)).toBeNull();
  });
});
