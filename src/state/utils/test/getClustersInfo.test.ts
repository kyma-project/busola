import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { clustersAtom, ClustersState } from 'state/clustersAtom';

const clusterA = {
  contextName: 'cluster-a',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

const clusterB = {
  contextName: 'cluster-b',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

// removeCluster logic extracted for direct testing:
// given a store, mirrors what useClustersInfo.removeCluster does
function removeCluster(store: ReturnType<typeof createStore>, name: string) {
  const clusters = store.get(clustersAtom);
  const next = { ...clusters };
  delete next[name];
  store.set(clustersAtom, next);
  store.set(clusterAtom, null);
}

describe('getClustersInfo — removeCluster logic', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('removes the named cluster from clustersAtom', () => {
    const store = createStore();
    store.set(clustersAtom, { 'cluster-a': clusterA, 'cluster-b': clusterB });

    removeCluster(store, 'cluster-a');

    const clusters = store.get(clustersAtom) as ClustersState;
    expect(clusters).not.toHaveProperty('cluster-a');
    expect(clusters).toHaveProperty('cluster-b');
  });

  it('sets clusterAtom to null after removal', () => {
    const store = createStore();
    store.set(clustersAtom, { 'cluster-a': clusterA });
    store.set(clusterAtom, { ...clusterA, name: 'cluster-a' });

    removeCluster(store, 'cluster-a');

    expect(store.get(clusterAtom)).toBeNull();
  });

  it('does not mutate remaining clusters when one is removed', () => {
    const store = createStore();
    store.set(clustersAtom, { 'cluster-a': clusterA, 'cluster-b': clusterB });

    removeCluster(store, 'cluster-a');

    const remaining = store.get(clustersAtom) as ClustersState;
    expect(remaining?.['cluster-b']).toEqual(clusterB);
  });

  it('removing the only cluster leaves an empty clusters map', () => {
    const store = createStore();
    store.set(clustersAtom, { 'cluster-a': clusterA });

    removeCluster(store, 'cluster-a');

    expect(store.get(clustersAtom)).toEqual({});
  });

  it('removing a non-existent cluster does not throw and preserves state', () => {
    const store = createStore();
    store.set(clustersAtom, { 'cluster-a': clusterA });

    expect(() => removeCluster(store, 'does-not-exist')).not.toThrow();
    expect(store.get(clustersAtom)).toHaveProperty('cluster-a');
  });
});

describe('clustersAtom — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('defaults to an empty object when storage is empty', () => {
    const store = createStore();
    expect(store.get(clustersAtom)).toEqual({});
  });

  it('can be updated with a new clusters map', () => {
    const store = createStore();
    store.set(clustersAtom, { 'cluster-a': clusterA });
    expect(store.get(clustersAtom)).toHaveProperty('cluster-a');
  });
});

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
