import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { clustersAtom } from 'state/clustersAtom';

const clusterA = {
  contextName: 'cluster-a',
  currentContext: {} as any,
  kubeconfig: {} as any,
  config: { storage: 'sessionStorage' as const },
};

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
