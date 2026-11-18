import { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { ColumnLayoutState, columnLayoutAtom } from 'state/columnLayoutAtom';
import { useCurrentResource } from './useResource';

const emptyLayout: ColumnLayoutState = {
  layout: 'OneColumn',
  startColumn: null,
  midColumn: null,
  endColumn: null,
};

const renderWithLayout = (columns: Partial<ColumnLayoutState> = {}) => {
  const store = createStore();
  store.set(columnLayoutAtom, { ...emptyLayout, ...columns });
  return renderHook(() => useCurrentResource(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  }).result.current;
};

describe('useCurrentResource', () => {
  it('returns empty values when no column is open', () => {
    expect(renderWithLayout()).toEqual({
      namespace: '',
      resourceType: '',
      groupVersion: '',
      resourceName: '',
    });
  });

  it('describes a core resource list in the start column', () => {
    const resource = renderWithLayout({
      startColumn: {
        resourceType: 'pods',
        resourceName: null,
        apiVersion: 'v1',
        namespaceId: 'default',
      },
    });

    expect(resource).toEqual({
      namespace: 'default',
      resourceType: 'Pod',
      groupVersion: 'v1',
      resourceName: '',
    });
  });

  it('prefers the middle column over the start column', () => {
    const resource = renderWithLayout({
      startColumn: {
        resourceType: 'namespaces',
        resourceName: null,
        apiVersion: 'v1',
      },
      midColumn: {
        resourceType: 'deployments',
        resourceName: 'my-app',
        apiGroup: 'apps',
        apiVersion: 'v1',
        namespaceId: 'default',
      },
    });

    expect(resource).toEqual({
      namespace: 'default',
      resourceType: 'Deployment',
      groupVersion: 'apps/v1',
      resourceName: 'my-app',
    });
  });

  it('prefers the end column over the other columns', () => {
    const resource = renderWithLayout({
      startColumn: {
        resourceType: 'namespaces',
        resourceName: null,
        apiVersion: 'v1',
      },
      midColumn: {
        resourceType: 'deployments',
        resourceName: 'my-app',
        apiGroup: 'apps',
        apiVersion: 'v1',
      },
      endColumn: {
        resourceType: 'pods',
        resourceName: 'my-pod',
        apiVersion: 'v1',
        namespaceId: 'default',
      },
    });

    expect(resource).toMatchObject({
      resourceType: 'Pod',
      resourceName: 'my-pod',
    });
  });

  it('prefers the raw resource type name over the resource type', () => {
    const resource = renderWithLayout({
      startColumn: {
        resourceType: 'horizontalpodautoscalers',
        rawResourceTypeName: 'HorizontalPodAutoscalers',
        resourceName: null,
        apiGroup: 'autoscaling',
        apiVersion: 'v2',
      },
    });

    expect(resource.resourceType).toBe('HorizontalPodAutoscaler');
    expect(resource.groupVersion).toBe('autoscaling/v2');
  });
});
