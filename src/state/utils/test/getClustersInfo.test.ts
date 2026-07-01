import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createStore } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { clustersAtom, ClustersState } from 'state/clustersAtom';

const mockNavigate = vi.fn();

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

import { useClustersInfo } from '../getClustersInfo';

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

describe('useClustersInfo', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('exposes currentCluster, clusters, setCurrentCluster, setClusters, removeCluster, navigate', () => {
    const { result } = renderHook(() => useClustersInfo());
    const keys = Object.keys(result.current);
    expect(keys).toEqual(
      expect.arrayContaining([
        'currentCluster',
        'clusters',
        'setCurrentCluster',
        'setClusters',
        'removeCluster',
        'navigate',
      ]),
    );
  });

  it('returns null as currentCluster when no cluster is active', () => {
    const { result } = renderHook(() => useClustersInfo());
    expect(result.current.currentCluster).toBeNull();
  });

  it('returns an empty object as clusters when none are stored', () => {
    const { result } = renderHook(() => useClustersInfo());
    expect(result.current.clusters).toEqual({});
  });

  it('exposes the navigate function from react-router', () => {
    const { result } = renderHook(() => useClustersInfo());
    expect(result.current.navigate).toBe(mockNavigate);
  });

  describe('removeCluster', () => {
    it('removes the named cluster and clears currentCluster', () => {
      const { result } = renderHook(() => useClustersInfo());

      act(() => {
        result.current.setClusters({
          'cluster-a': clusterA,
          'cluster-b': clusterB,
        });
        result.current.setCurrentCluster({ ...clusterA, name: 'cluster-a' });
      });

      act(() => {
        result.current.removeCluster('cluster-a');
      });

      const clusters = result.current.clusters as ClustersState;
      expect(clusters).not.toHaveProperty('cluster-a');
      expect(clusters).toHaveProperty('cluster-b');
      expect(result.current.currentCluster).toBeNull();
    });

    it('does not mutate remaining clusters when one is removed', () => {
      const { result } = renderHook(() => useClustersInfo());

      act(() => {
        result.current.setClusters({
          'cluster-a': clusterA,
          'cluster-b': clusterB,
        });
      });

      act(() => {
        result.current.removeCluster('cluster-a');
      });

      expect(result.current.clusters?.['cluster-b']).toEqual(clusterB);
    });

    it('removing the only cluster leaves an empty clusters map', () => {
      const { result } = renderHook(() => useClustersInfo());

      act(() => {
        result.current.setClusters({ 'cluster-a': clusterA });
      });

      act(() => {
        result.current.removeCluster('cluster-a');
      });

      expect(result.current.clusters).toEqual({});
    });

    it('removing a non-existent cluster does not throw and preserves state', () => {
      const { result } = renderHook(() => useClustersInfo());

      act(() => {
        result.current.setClusters({ 'cluster-a': clusterA });
      });

      expect(() => {
        act(() => {
          result.current.removeCluster('does-not-exist');
        });
      }).not.toThrow();

      expect(result.current.clusters).toHaveProperty('cluster-a');
    });
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
