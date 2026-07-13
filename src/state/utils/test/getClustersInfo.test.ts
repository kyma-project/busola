import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { ClustersState } from 'state/clustersAtom';

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

function renderWithStore() {
  const store = createStore();
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(JotaiProvider, { store }, children);
  const { result } = renderHook(() => useClustersInfo(), { wrapper });
  return result;
}

describe('useClustersInfo', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  it('exposes currentCluster, clusters, setCurrentCluster, setClusters, removeCluster, navigate', () => {
    const result = renderWithStore();
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
    const result = renderWithStore();
    expect(result.current.currentCluster).toBeNull();
  });

  it('returns an empty object as clusters when none are stored', () => {
    const result = renderWithStore();
    expect(result.current.clusters).toEqual({});
  });

  it('exposes the navigate function from react-router', () => {
    const result = renderWithStore();
    expect(result.current.navigate).toBe(mockNavigate);
  });

  describe('removeCluster', () => {
    it('removes the named cluster and clears currentCluster', () => {
      const result = renderWithStore();

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
      const result = renderWithStore();

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
      const result = renderWithStore();

      act(() => {
        result.current.setClusters({ 'cluster-a': clusterA });
      });

      act(() => {
        result.current.removeCluster('cluster-a');
      });

      expect(result.current.clusters).toEqual({});
    });

    it('removing a non-existent cluster does not throw and preserves state', () => {
      const result = renderWithStore();

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
