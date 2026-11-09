import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useModulesLiveResources } from './hooks';

const fetchMock = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => fetchMock,
}));

const populateMock = vi.fn(async (resource: any) => resource);
vi.mock('hooks/usePopulateWithNamespace', () => ({
  usePopulateWithNamespace: () => populateMock,
}));

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
