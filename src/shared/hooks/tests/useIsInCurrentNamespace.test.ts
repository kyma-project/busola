import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { K8sResource } from 'types';

const state = vi.hoisted(() => ({
  nodes: [] as Array<{ resourceType: string; namespaced: boolean }>,
  namespace: '',
}));

vi.mock('state/navigation/allNodesAtom', () => ({
  allNodesAtomSync: 'ALL_NODES_ATOM',
}));
vi.mock('state/activeNamespaceIdAtom', () => ({
  activeNamespaceIdAtom: 'ACTIVE_NAMESPACE_ATOM',
}));
vi.mock('jotai', () => ({
  useAtomValue: (atom: unknown) =>
    atom === 'ALL_NODES_ATOM' ? state.nodes : state.namespace,
}));

// Imported after the mocks are registered.
import { useIsInCurrentNamespace } from '../useIsInCurrentNamespace';

const pod = (namespace?: string) =>
  ({
    kind: 'Pod',
    metadata: { name: 'p', namespace },
  }) as K8sResource;

beforeEach(() => {
  state.nodes = [{ resourceType: 'pods', namespaced: true }];
  state.namespace = 'default';
});

describe('useIsInCurrentNamespace', () => {
  it('is true for a namespaced resource that lives in the active namespace', () => {
    const { result } = renderHook(() =>
      useIsInCurrentNamespace(pod('default')),
    );

    expect(result.current).toBe(true);
  });

  it('is false for a namespaced resource from a different namespace', () => {
    const { result } = renderHook(() =>
      useIsInCurrentNamespace(pod('other-ns')),
    );

    expect(result.current).toBe(false);
  });

  it('is true when all namespaces are selected (empty active namespace)', () => {
    state.namespace = '';

    const { result } = renderHook(() =>
      useIsInCurrentNamespace(pod('other-ns')),
    );

    expect(result.current).toBe(true);
  });

  it('is true for a resource type that is not known to be namespace-wide', () => {
    const { result } = renderHook(() =>
      useIsInCurrentNamespace({
        kind: 'ClusterRole',
        metadata: { name: 'admin' },
      } as K8sResource),
    );

    expect(result.current).toBe(true);
  });

  it('is true for a namespaced resource without its own namespace set', () => {
    const { result } = renderHook(() =>
      useIsInCurrentNamespace(pod(undefined)),
    );

    expect(result.current).toBe(true);
  });
});
