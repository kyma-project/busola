import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import React from 'react';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useModuleNavigation } from './useModuleNavigation';

const navigateMock = vi.fn();
vi.mock('react-router', async () => {
  const actual: any = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('hooks/useUrl', () => ({
  useUrl: () => ({
    clusterUrl: (p: string) => `/cluster/${p}`,
    namespaceUrl: (p: string) => `/ns/${p}`,
  }),
}));

// Cluster-scoped resource for these assertions.
vi.mock('shared/hooks/BackendAPI/useGet', () => ({
  useGetScope: () => async () => false,
}));

const fetchMock = vi.fn().mockResolvedValue({
  json: async () => ({
    items: [{ metadata: { name: 'foo-instance', namespace: 'foo-ns' } }],
  }),
});
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => fetchMock,
}));

// A community extension whose urlPath deliberately differs from
// pluralize(kind): pluralize('Foo') === 'foos', urlPath === 'custom-foos'.
const extensionWithCustomUrlPath = {
  metadata: { name: 'foo-extension' },
  data: {
    general: JSON.stringify({
      resource: { kind: 'Foo' },
      urlPath: 'custom-foos',
    }),
  },
};

const clickedModule = {
  name: 'foo',
  resource: {
    kind: 'Foo',
    apiVersion: 'foo.example.com/v1',
    metadata: { name: 'foo-instance', namespace: 'foo-ns' },
  },
};

const renderNavHook = (
  overrides: Record<string, any> = {},
  store = createStore(),
) => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const { result } = renderHook(
    () =>
      useModuleNavigation({
        moduleTemplates: { items: [] } as any,
        extensions: [extensionWithCustomUrlPath],
        crds: { items: [] },
        namespaced: false,
        installedModules: [{ name: 'foo' }],
        setOpenedModuleIndex: vi.fn(),
        checkModuleState: false,
        ...overrides,
      }),
    { wrapper },
  );
  return { result, store };
};

describe('useModuleNavigation — extension urlPath resolution (regression #10718)', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    fetchMock.mockClear();
  });

  it('navigates using the extension urlPath, not the bare plural', async () => {
    const { result } = renderNavHook();

    await result.current.handleClickResource('foo', clickedModule);

    expect(navigateMock).toHaveBeenCalledWith(
      '/cluster/kymamodules/custom-foos/foo-instance?layout=TwoColumnsMidExpanded',
    );
  });

  it('sets midColumn.resourceType to the extension urlPath so the CR pane resolves', async () => {
    const { result, store } = renderNavHook();

    await result.current.handleClickResource('foo', clickedModule);

    const midColumn = store.get(columnLayoutAtom).midColumn;
    expect(midColumn?.resourceType).toBe('custom-foos');
    expect(midColumn?.rawResourceTypeName).toBe('Foo');
    expect(midColumn?.resourceName).toBe('foo-instance');
  });
});

describe('useModuleNavigation — community live-CR gate (issue #10718)', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    fetchMock.mockClear();
    fetchMock.mockResolvedValue({
      json: async () => ({
        items: [{ metadata: { name: 'foo-instance', namespace: 'foo-ns' } }],
      }),
    });
  });

  it('hasDetailsLink is false for a community module without a live CR instance', () => {
    const { result } = renderNavHook();

    expect(
      result.current.hasDetailsLink({
        ...clickedModule,
        hasLiveResource: false,
      }),
    ).toBe(false);
  });

  it('hasDetailsLink is false while live-CR existence is still unknown', () => {
    const { result } = renderNavHook();

    // hasLiveResource undefined ⇒ not yet confirmed ⇒ no details.
    expect(result.current.hasDetailsLink(clickedModule)).toBe(false);
  });

  it('hasDetailsLink is true for a community module with a live CR instance', () => {
    const { result } = renderNavHook();

    expect(
      result.current.hasDetailsLink({
        ...clickedModule,
        hasLiveResource: true,
      }),
    ).toBe(true);
  });

  it('does not navigate when the module is flagged as having no live CR', async () => {
    const { result } = renderNavHook();

    await result.current.handleClickResource('foo', {
      ...clickedModule,
      hasLiveResource: false,
    });

    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('does not navigate when the live-CR fetch returns no items', async () => {
    const { result } = renderNavHook();
    fetchMock.mockResolvedValueOnce({ json: async () => ({ items: [] }) });

    await result.current.handleClickResource('foo', clickedModule);

    expect(navigateMock).not.toHaveBeenCalled();
  });
});

describe('useModuleNavigation — managed state gate preserved', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    fetchMock.mockClear();
    fetchMock.mockResolvedValue({
      json: async () => ({
        items: [{ metadata: { name: 'foo-instance', namespace: 'foo-ns' } }],
      }),
    });
  });

  it('managed modules still gate details on positive module state, not live-CR flag', () => {
    const { result } = renderNavHook({ checkModuleState: true });

    expect(
      result.current.hasDetailsLink({ ...clickedModule, state: 'Ready' }),
    ).toBe(true);
    expect(
      result.current.hasDetailsLink({ ...clickedModule, state: 'Warning' }),
    ).toBe(false);
  });
});
