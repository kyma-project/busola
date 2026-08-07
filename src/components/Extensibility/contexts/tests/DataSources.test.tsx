import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { useContext, useEffect } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import { JotaiHydrator } from 'testing/reactTestingUtils';
import { activeNamespaceIdAtom } from 'state/activeNamespaceIdAtom';
import { resourcesConditionsAtom } from 'state/resourceConditionsAtom';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { jsonataWrapper } from '../../helpers/jsonataWrapper';
import {
  DataSourcesContext,
  DataSourcesContextProvider,
  DataSourcesContextType,
  DataSources,
  Resource,
} from '../DataSources';

vi.mock('shared/hooks/BackendAPI/useFetch');
vi.mock('../../helpers/jsonataWrapper');

const mockFetch = vi.fn();

// Module-level so React sees the same component type across rerenders.
// A definition inside makeTree would create a new type each call, causing unmount/remount.
const ContextCapture = ({
  boxRef,
}: {
  boxRef: { current: DataSourcesContextType };
}) => {
  const value = useContext(DataSourcesContext);
  // No deps — always capture the latest context value after every render.
  useEffect(() => {
    boxRef.current = value;
  });
  return null;
};

const makeTree = (
  dataSources: DataSources,
  fallbackNs = 'default-ns',
  ctxBox: { current: DataSourcesContextType } = {
    current: {} as DataSourcesContextType,
  },
) => ({
  tree: (
    <JotaiProvider>
      <JotaiHydrator
        initialValues={[
          [activeNamespaceIdAtom, fallbackNs],
          [resourcesConditionsAtom, {}],
        ]}
      >
        <DataSourcesContextProvider dataSources={dataSources}>
          <ContextCapture boxRef={ctxBox} />
        </DataSourcesContextProvider>
      </JotaiHydrator>
    </JotaiProvider>
  ),
  ctx: () => ctxBox.current,
  ctxBox,
});

const makeResource = (name = 'my-res', namespace = 'res-ns'): Resource => ({
  metadata: {
    name,
    namespace,
    labels: { app: 'test', env: 'prod' },
    annotations: {},
  },
  spec: {},
});

const renderAndRequest = async (
  dataSources: DataSources,
  dataSourceName: string,
  resource = makeResource(),
  fallbackNs = 'default-ns',
) => {
  const { tree, ctx } = makeTree(dataSources, fallbackNs);
  await act(async () => {
    render(tree);
  });
  await act(async () => {
    await ctx().requestRelatedResource(resource, dataSourceName);
  });
  return ctx;
};

const baseDataSource = {
  resource: {
    kind: 'Pod',
    group: '',
    version: 'v1',
    namespace: 'ds-ns',
    name: '',
  },
  ownerLabelSelectorPath: '',
  filter: '',
};

beforeEach(() => {
  vi.mocked(useFetch).mockReturnValue(mockFetch);
  mockFetch.mockResolvedValue({ json: vi.fn().mockResolvedValue({}) });
  vi.mocked(jsonataWrapper).mockReturnValue({
    assign: vi.fn(),
    evaluate: vi.fn().mockResolvedValue(true),
  } as any);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('DataSourcesContextProvider', () => {
  describe('getRelatedResourceInPath', () => {
    it('returns the matching data source name when path starts with $name', async () => {
      const { tree, ctx } = makeTree({ pods: baseDataSource });
      await act(async () => {
        render(tree);
      });
      expect(
        ctx().getRelatedResourceInPath('$pods.items[0].metadata.name'),
      ).toBe('pods');
    });

    it('returns undefined when no data source name matches', async () => {
      const { tree, ctx } = makeTree({ pods: baseDataSource });
      await act(async () => {
        render(tree);
      });
      expect(
        ctx().getRelatedResourceInPath('$services.metadata'),
      ).toBeUndefined();
    });

    it('returns the correct source name among multiple data sources', async () => {
      const services = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, kind: 'Service' },
      };
      const { tree, ctx } = makeTree({ pods: baseDataSource, services });
      await act(async () => {
        render(tree);
      });
      expect(ctx().getRelatedResourceInPath('$services.spec.clusterIP')).toBe(
        'services',
      );
      expect(ctx().getRelatedResourceInPath('$pods.status.phase')).toBe('pods');
    });
  });

  describe('buildUrl', () => {
    it('builds a namespaced URL with an API group', async () => {
      const ds = {
        ...baseDataSource,
        resource: {
          kind: 'Deployment',
          group: 'apps',
          version: 'v1',
          namespace: 'my-ns',
          name: '',
        },
      };
      await renderAndRequest({ ds }, 'ds');
      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/apis/apps/v1/namespaces/my-ns/deployments',
      });
    });

    it('uses /api prefix when group is empty', async () => {
      await renderAndRequest({ ds: baseDataSource }, 'ds');
      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/ds-ns/pods',
      });
    });

    it('builds a cluster-scoped URL when namespace is "-all-"', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, namespace: '-all-' },
      };
      await renderAndRequest({ ds }, 'ds');
      expect(mockFetch).toHaveBeenCalledWith({ relativeUrl: '/api/v1/pods' });
    });

    it('falls back to resource.metadata.namespace when dataSource has no namespace', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, namespace: undefined as any },
      };
      await renderAndRequest({ ds }, 'ds', makeResource('r', 'resource-ns'));
      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/resource-ns/pods',
      });
    });

    it('falls back to atom namespace when neither dataSource nor resource have a namespace', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, namespace: undefined as any },
      };
      const resourceWithoutNs = {
        ...makeResource(),
        metadata: { ...makeResource().metadata, namespace: '' },
      };
      await renderAndRequest({ ds }, 'ds', resourceWithoutNs, 'atom-ns');
      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/atom-ns/pods',
      });
    });

    it('appends the resource name to the URL when name is specified', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, name: 'specific-pod' },
      };
      await renderAndRequest({ ds }, 'ds');
      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/ds-ns/pods/specific-pod',
      });
    });

    it('builds ?labelSelector query from ownerLabelSelectorPath', async () => {
      const ds = {
        ...baseDataSource,
        ownerLabelSelectorPath: '$.metadata.labels',
      };
      await renderAndRequest({ ds }, 'ds');
      const { relativeUrl } = mockFetch.mock.calls[0][0] as {
        relativeUrl: string;
      };
      expect(relativeUrl).toContain('?labelSelector=');
      expect(relativeUrl).toContain('app=test');
      expect(relativeUrl).toContain('env=prod');
    });
  });

  describe('requestRelatedResource', () => {
    it('returns a Promise on first call, sets loading, and returns the same promise while in-flight', async () => {
      mockFetch.mockReturnValue(new Promise(() => {}));
      const { tree, ctx } = makeTree({ ds: baseDataSource });
      await act(async () => {
        render(tree);
      });
      const res = makeResource();

      let firstResult: any;
      act(() => {
        firstResult = ctx().requestRelatedResource(res, 'ds');
      });

      expect(firstResult).toBeInstanceOf(Promise);
      expect(ctx().store.ds?.loading).toBe(true);
      expect(ctx().requestRelatedResource(res, 'ds')).toBe(
        ctx().store.ds?.firstFetch,
      );
    });

    it('does not re-fetch on subsequent calls with the same resource and filter', async () => {
      const res = makeResource();
      const ctx = await renderAndRequest({ ds: baseDataSource }, 'ds', res);
      mockFetch.mockClear();

      act(() => {
        ctx().requestRelatedResource(res, 'ds');
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('re-fetches when the resource name changes', async () => {
      const ctx = await renderAndRequest(
        { ds: baseDataSource },
        'ds',
        makeResource('first'),
      );
      mockFetch.mockClear();

      await act(async () => {
        await ctx().requestRelatedResource(makeResource('second'), 'ds');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('re-fetches when the dataSource filter changes', async () => {
      const ds1 = { ...baseDataSource, filter: 'status = "Running"' };
      const ds2 = { ...baseDataSource, filter: 'status = "Pending"' };
      // Pass ctxBox into the second makeTree call so both renders share the same box.
      const { tree, ctx, ctxBox } = makeTree({ ds: ds1 });
      const { rerender } = render(tree);
      const res = makeResource();

      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });
      mockFetch.mockClear();
      await act(async () => {
        rerender(makeTree({ ds: ds2 }, 'default-ns', ctxBox).tree);
      });
      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns cached data after fetch completes and resource has not changed', async () => {
      const mockData = { items: [{ metadata: { name: 'pod-1' } }] };
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockData),
      });
      const res = makeResource();
      const ctx = await renderAndRequest({ ds: baseDataSource }, 'ds', res);

      const result = ctx().requestRelatedResource(res, 'ds');
      expect(result).toMatchObject({ items: expect.any(Array) });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchResource', () => {
    it('clears loading and populates store.data on successful fetch', async () => {
      const mockData = { items: [{ metadata: { name: 'pod-1' } }] };
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockData),
      });
      const ctx = await renderAndRequest({ ds: baseDataSource }, 'ds');

      expect(ctx().store.ds.loading).toBe(false);
      expect(ctx().store.ds.error).toBeNull();
      expect(ctx().store.ds.data).toMatchObject({
        items: [{ metadata: { name: 'pod-1' } }],
      });
    });

    it('sets store.error and clears loading on fetch failure', async () => {
      const fetchError = new Error('Network failure');
      mockFetch.mockRejectedValue(fetchError);
      const ctx = await renderAndRequest({ ds: baseDataSource }, 'ds');

      expect(ctx().store.ds.loading).toBe(false);
      expect(ctx().store.ds.error).toBe(fetchError);
    });

    it('applies jsonata filter to items array, keeping only matching items', async () => {
      const items = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ items }),
      });
      vi.mocked(jsonataWrapper).mockReturnValue({
        assign: vi.fn(),
        evaluate: vi
          .fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true),
      } as any);

      const ctx = await renderAndRequest(
        { ds: { ...baseDataSource, filter: '$item.name != "b"' } },
        'ds',
      );

      expect(ctx().store.ds.data.items).toHaveLength(2);
      expect(ctx().store.ds.data.items[0]).toBe(items[0]);
      expect(ctx().store.ds.data.items[1]).toBe(items[2]);
    });

    it('sets data to null when filter excludes a single (non-list) resource', async () => {
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ metadata: { name: 'pod-1' } }),
      });
      vi.mocked(jsonataWrapper).mockReturnValue({
        assign: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(false),
      } as any);

      const ctx = await renderAndRequest(
        { ds: { ...baseDataSource, filter: 'someFilter' } },
        'ds',
      );

      expect(ctx().store.ds.data).toBeNull();
    });

    it('passes the root resource to the filter expression via assign("root", ...)', async () => {
      const expr = {
        assign: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(jsonataWrapper).mockReturnValue(expr as any);
      const res = makeResource();

      await renderAndRequest(
        { ds: { ...baseDataSource, filter: 'someFilter' } },
        'ds',
        res,
      );

      expect(expr.assign).toHaveBeenCalledWith('root', res);
    });
  });
});
