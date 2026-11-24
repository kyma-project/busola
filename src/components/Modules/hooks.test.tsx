import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useFetchModuleData, useModulesLiveResources } from './hooks';
import type { ModuleTemplateType } from './support';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { getDefaultStore, type PrimitiveAtom } from 'jotai';
import { allNodesAtomSync } from 'state/navigation/allNodesAtom';

const fetchMock = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: vi.fn(() => fetchMock),
}));

const populateMock = vi.fn(async (resource: any) => resource);
vi.mock('hooks/usePopulateWithNamespace', () => ({
  usePopulateWithNamespace: () => populateMock,
}));

vi.mock('state/navigation/allNodesAtom', async () => {
  const { atom } = await import('jotai');
  return {
    allNodesAtomSync: atom([{ resourceType: 'deployments', namespaced: true }]),
  };
});

describe('useFetchModuleData', () => {
  const templates = {
    items: ['east', 'east', 'west'].map((namespace, i) => ({
      metadata: { name: `module-${i}`, namespace, labels: {}, annotations: {} },
      spec: {
        channel: 'regular',
        version: '1.0.0',
        associatedResources: [],
        data: {},
        manager: {
          group: 'apps',
          version: 'v1',
          kind: 'Deployment',
          name: 'manager',
          namespace,
        },
      },
    })),
  };
  const selectManager = (template: ModuleTemplateType) => template.spec.manager;
  const managerUrl = (namespace: string) =>
    `/apis/apps/v1/namespaces/${namespace}/deployments?fieldSelector=metadata.name=manager`;

  const renderPolling = (moduleTemplates: typeof templates) =>
    renderHook(
      ({ moduleTemplates }) =>
        useFetchModuleData(
          moduleTemplates,
          selectManager,
          'manager',
          false,
          5000,
        ),
      { initialProps: { moduleTemplates } },
    );

  const store = getDefaultStore();
  const nodesAtom = allNodesAtomSync as unknown as PrimitiveAtom<
    { resourceType: string; namespaced: boolean }[]
  >;
  const knownNodes = store.get(nodesAtom);

  beforeEach(() => {
    fetchMock.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(useFetch).mockReturnValue(fetchMock);
    store.set(nodesAtom, knownNodes);
  });

  it('looks up right away once the nodes arrive and polls on through later node changes', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => Response.json({ items: [] }));
    act(() => store.set(nodesAtom, []));
    renderPolling(templates);
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => store.set(nodesAtom, knownNodes));
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    act(() => store.set(nodesAtom, [...knownNodes]));
    await act(() => vi.advanceTimersByTimeAsync(4999));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('keeps its polling interval when the templates are replaced by equal ones', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => Response.json({ items: [] }));
    const { rerender } = renderPolling(templates);
    await act(() => vi.advanceTimersByTimeAsync(3000));

    rerender({ moduleTemplates: structuredClone(templates) });
    await act(() => vi.advanceTimersByTimeAsync(1999));
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('looks up an added template right away', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => Response.json({ items: [] }));
    const { rerender } = renderPolling(templates);
    await act(() => vi.advanceTimersByTimeAsync(0));

    const added = structuredClone(templates.items[2]);
    added.metadata.name = 'module-3';
    added.spec.manager.namespace = 'north';
    rerender({ moduleTemplates: { items: [...templates.items, added] } });
    await act(() => vi.advanceTimersByTimeAsync(0));

    expect(fetchMock).toHaveBeenCalledTimes(5);
    expect(fetchMock).toHaveBeenCalledWith({
      relativeUrl: managerUrl('north'),
    });
  });

  it('polls with the fetch function of the latest render', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(async () => Response.json({ items: [] }));
    const { rerender } = renderPolling(templates);
    await act(() => vi.advanceTimersByTimeAsync(0));

    const renewedFetch = vi.fn(async () => Response.json({ items: [] }));
    vi.mocked(useFetch).mockReturnValue(renewedFetch);
    rerender({ moduleTemplates: templates });
    await act(() => vi.advanceTimersByTimeAsync(5000));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(renewedFetch).toHaveBeenCalledTimes(2);
  });

  it('shares each deployment lookup across templates and fetches it again on the next poll', async () => {
    vi.useFakeTimers();
    let resourceVersion = '1';
    fetchMock.mockImplementation(async ({ relativeUrl }) => {
      const namespace = relativeUrl === managerUrl('east') ? 'east' : 'west';
      return Response.json({
        items: [{ metadata: { namespace, resourceVersion } }],
      });
    });
    const { result } = renderHook(() =>
      useFetchModuleData(templates, selectManager, 'manager', false, 5000),
    );
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith({ relativeUrl: managerUrl('east') });
    expect(fetchMock).toHaveBeenCalledWith({ relativeUrl: managerUrl('west') });
    for (const { metadata } of templates.items) {
      expect(result.current.getItem(metadata.name, metadata.namespace)).toEqual(
        {
          metadata: { namespace: metadata.namespace, resourceVersion: '1' },
        },
      );
    }

    resourceVersion = '2';
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(fetchMock).toHaveBeenCalledTimes(4);
    for (const { metadata } of templates.items) {
      expect(result.current.getItem(metadata.name, metadata.namespace)).toEqual(
        {
          metadata: { namespace: metadata.namespace, resourceVersion: '2' },
        },
      );
    }
  });

  it('reports a shared failure for each affected template and keeps successful results', async () => {
    const westManager = { metadata: { namespace: 'west' } };
    fetchMock.mockImplementation(async ({ relativeUrl }) => {
      if (relativeUrl === managerUrl('east')) throw new Error('lookup failed');
      return Response.json({ items: [westManager] });
    });
    const { result } = renderHook(() =>
      useFetchModuleData(templates, selectManager, 'manager'),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.error).toContain(
      'Error fetching manager for module "module-0": lookup failed',
    );
    expect(result.current.error).toContain(
      'Error fetching manager for module "module-1": lookup failed',
    );
    expect(result.current.data).toEqual({ 'module-2:west': westManager });
  });
});

describe('useModulesLiveResources', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    populateMock.mockReset();
    populateMock.mockImplementation(async (resource: any) => resource);
  });

  it('includes only modules whose live CR instance exists on the cluster', async () => {
    // registry-proxy has a live CR; the others (installed operator, but no CR
    // instance) do not.
    fetchMock.mockImplementation(
      async ({ relativeUrl }: { relativeUrl: string }) => ({
        json: async () =>
          relativeUrl.includes('registryproxies')
            ? { items: [{ metadata: { name: 'registry-proxy' } }] }
            : { items: [] },
      }),
    );

    const modules = [
      {
        name: 'registry-proxy',
        resource: {
          kind: 'RegistryProxy',
          apiVersion: 'operator.kyma-project.io/v1',
          metadata: { name: 'registry-proxy', namespace: 'default' },
        },
      },
      {
        name: 'test-module',
        resource: {
          kind: 'TestModule',
          apiVersion: 'example.com/v1',
          metadata: { name: 'test-module', namespace: 'default' },
        },
      },
    ];

    const { result } = renderHook(() =>
      useModulesLiveResources(modules, false),
    );

    await waitFor(() =>
      expect(result.current.has('registry-proxy')).toBe(true),
    );
    expect(result.current.has('test-module')).toBe(false);
    // The map now carries the live CR itself, not just its presence — the row's
    // State column reads it directly.
    expect(result.current.get('registry-proxy')).toEqual({
      metadata: { name: 'registry-proxy' },
    });
  });

  it('treats a fetch failure as "no live resource"', async () => {
    fetchMock.mockRejectedValue(new Error('network'));

    const modules = [
      {
        name: 'broken',
        resource: {
          kind: 'Broken',
          apiVersion: 'example.com/v1',
          metadata: { name: 'broken', namespace: 'default' },
        },
      },
    ];

    const { result } = renderHook(() =>
      useModulesLiveResources(modules, false),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(result.current.has('broken')).toBe(false);
  });

  it('keeps healthy modules when another module throws a non-404', async () => {
    populateMock.mockImplementation(async (resource: any) => {
      if (resource.kind === 'Broken') {
        throw new Error('scope lookup failed');
      }
      return resource;
    });
    fetchMock.mockImplementation(
      async ({ relativeUrl }: { relativeUrl: string }) => ({
        json: async () =>
          relativeUrl.includes('registryproxies')
            ? { items: [{ metadata: { name: 'registry-proxy' } }] }
            : { items: [] },
      }),
    );

    const modules = [
      {
        name: 'broken',
        resource: {
          kind: 'Broken',
          apiVersion: 'example.com/v1',
          metadata: { name: 'broken', namespace: 'default' },
        },
      },
      {
        name: 'registry-proxy',
        resource: {
          kind: 'RegistryProxy',
          apiVersion: 'operator.kyma-project.io/v1',
          metadata: { name: 'registry-proxy', namespace: 'default' },
        },
      },
    ];

    const { result } = renderHook(() =>
      useModulesLiveResources(modules, false),
    );

    await waitFor(() =>
      expect(result.current.has('registry-proxy')).toBe(true),
    );
    expect(result.current.has('broken')).toBe(false);
  });

  it('does not fetch while the module list is still loading', () => {
    const { result } = renderHook(() =>
      useModulesLiveResources(
        [
          {
            name: 'x',
            resource: {
              kind: 'X',
              apiVersion: 'example.com/v1',
              metadata: { name: 'x', namespace: 'default' },
            },
          },
        ],
        true,
      ),
    );

    expect(result.current.size).toBe(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
