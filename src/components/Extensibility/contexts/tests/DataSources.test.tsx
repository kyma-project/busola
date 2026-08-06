import { describe, it, expect, beforeEach, vi } from 'vitest';
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

// Capture context value via effect so we don't mutate outer scope during render
const ctxBox: { current: DataSourcesContextType } = {
  current: {} as DataSourcesContextType,
};
const ctx = () => ctxBox.current;

const ContextCapture = () => {
  const value = useContext(DataSourcesContext);
  useEffect(() => {
    ctxBox.current = value;
  });
  return null;
};

const makeTree = (dataSources: DataSources, fallbackNs = 'default-ns') => (
  <JotaiProvider>
    <JotaiHydrator
      initialValues={[
        [activeNamespaceIdAtom, fallbackNs],
        [resourcesConditionsAtom, {}],
      ]}
    >
      <DataSourcesContextProvider dataSources={dataSources}>
        <ContextCapture />
      </DataSourcesContextProvider>
    </JotaiHydrator>
  </JotaiProvider>
);

const makeResource = (name = 'my-res', namespace = 'res-ns'): Resource => ({
  metadata: {
    name,
    namespace,
    labels: { app: 'test', env: 'prod' },
    annotations: {},
  },
  spec: {},
});

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
      await act(async () => {
        render(makeTree({ pods: baseDataSource }));
      });
      expect(
        ctx().getRelatedResourceInPath('$pods.items[0].metadata.name'),
      ).toBe('pods');
    });

    it('returns undefined when no data source name matches', async () => {
      await act(async () => {
        render(makeTree({ pods: baseDataSource }));
      });
      expect(
        ctx().getRelatedResourceInPath('$services.metadata'),
      ).toBeUndefined();
    });

    it('returns undefined when path does not start with $', async () => {
      await act(async () => {
        render(makeTree({ pods: baseDataSource }));
      });
      expect(ctx().getRelatedResourceInPath('pods.items')).toBeUndefined();
    });

    it('returns the correct source name among multiple data sources', async () => {
      const services = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, kind: 'Service' },
      };
      await act(async () => {
        render(makeTree({ pods: baseDataSource, services }));
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
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/apis/apps/v1/namespaces/my-ns/deployments',
      });
    });

    it('uses /api prefix when group is empty', async () => {
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/ds-ns/pods',
      });
    });

    it('builds a cluster-scoped URL when namespace is "-all-"', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, namespace: '-all-' },
      };
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(mockFetch).toHaveBeenCalledWith({ relativeUrl: '/api/v1/pods' });
    });

    it('falls back to resource.metadata.namespace when dataSource has no namespace', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, namespace: undefined as any },
      };
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(
          makeResource('r', 'resource-ns'),
          'ds',
        );
      });

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
      await act(async () => {
        render(makeTree({ ds }, 'atom-ns'));
      });

      await act(async () => {
        await ctx().requestRelatedResource(resourceWithoutNs, 'ds');
      });

      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/atom-ns/pods',
      });
    });

    it('appends the resource name to the URL when name is specified', async () => {
      const ds = {
        ...baseDataSource,
        resource: { ...baseDataSource.resource, name: 'specific-pod' },
      };
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(mockFetch).toHaveBeenCalledWith({
        relativeUrl: '/api/v1/namespaces/ds-ns/pods/specific-pod',
      });
    });

    it('builds ?labelSelector query from ownerLabelSelectorPath', async () => {
      const ds = {
        ...baseDataSource,
        ownerLabelSelectorPath: '$.metadata.labels',
      };
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      const { relativeUrl } = mockFetch.mock.calls[0][0] as {
        relativeUrl: string;
      };
      expect(relativeUrl).toContain('?labelSelector=');
      expect(relativeUrl).toContain('app=test');
      expect(relativeUrl).toContain('env=prod');
    });
  });

  describe('requestRelatedResource', () => {
    it('sets store.loading to true and returns a Promise on first call', async () => {
      mockFetch.mockReturnValue(new Promise(() => {}));
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });

      let result: any;
      act(() => {
        result = ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(result).toBeInstanceOf(Promise);
      expect(ctx().store.ds?.loading).toBe(true);
    });

    it('does not re-fetch on subsequent calls with the same resource and filter', async () => {
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });
      const res = makeResource();

      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });

      mockFetch.mockClear();

      act(() => {
        ctx().requestRelatedResource(res, 'ds');
      });

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('re-fetches when the resource name changes', async () => {
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource('first'), 'ds');
      });

      mockFetch.mockClear();

      await act(async () => {
        await ctx().requestRelatedResource(makeResource('second'), 'ds');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('re-fetches when the dataSource filter changes', async () => {
      const ds1 = { ...baseDataSource, filter: 'status = "Running"' };
      const ds2 = { ...baseDataSource, filter: 'status = "Pending"' };
      const { rerender } = render(makeTree({ ds: ds1 }));
      const res = makeResource();

      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });

      mockFetch.mockClear();

      await act(async () => {
        rerender(makeTree({ ds: ds2 }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns the in-flight firstFetch promise while loading', async () => {
      mockFetch.mockReturnValue(new Promise(() => {}));
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });
      const res = makeResource();

      act(() => {
        ctx().requestRelatedResource(res, 'ds');
      });

      const result = ctx().requestRelatedResource(res, 'ds');
      expect(result).toBe(ctx().store.ds?.firstFetch);
    });

    it('returns cached data after fetch completes and resource has not changed', async () => {
      const mockData = { items: [{ metadata: { name: 'pod-1' } }] };
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockData),
      });
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });
      const res = makeResource();

      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });

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
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(ctx().store.ds.loading).toBe(false);
      expect(ctx().store.ds.error).toBeNull();
      expect(ctx().store.ds.data).toMatchObject({
        items: [{ metadata: { name: 'pod-1' } }],
      });
    });

    it('sets store.error and clears loading on fetch failure', async () => {
      const fetchError = new Error('Network failure');
      mockFetch.mockRejectedValue(fetchError);
      await act(async () => {
        render(makeTree({ ds: baseDataSource }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(ctx().store.ds.loading).toBe(false);
      expect(ctx().store.ds.error).toBe(fetchError);
    });

    it('applies jsonata filter to items array, keeping only matching items', async () => {
      const items = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ items }),
      });

      const expr = {
        assign: vi.fn(),
        evaluate: vi
          .fn()
          .mockResolvedValueOnce(true)
          .mockResolvedValueOnce(false)
          .mockResolvedValueOnce(true),
      };
      vi.mocked(jsonataWrapper).mockReturnValue(expr as any);

      const ds = { ...baseDataSource, filter: '$item.name != "b"' };
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(ctx().store.ds.data.items).toHaveLength(2);
      expect(ctx().store.ds.data.items[0]).toBe(items[0]);
      expect(ctx().store.ds.data.items[1]).toBe(items[2]);
    });

    it('sets data to null when filter excludes a single (non-list) resource', async () => {
      mockFetch.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ metadata: { name: 'pod-1' } }),
      });

      const expr = {
        assign: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(false),
      };
      vi.mocked(jsonataWrapper).mockReturnValue(expr as any);

      const ds = { ...baseDataSource, filter: 'someFilter' };
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(makeResource(), 'ds');
      });

      expect(ctx().store.ds.data).toBeNull();
    });

    it('passes the root resource to the filter expression via assign("root", ...)', async () => {
      const expr = {
        assign: vi.fn(),
        evaluate: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(jsonataWrapper).mockReturnValue(expr as any);

      const ds = { ...baseDataSource, filter: 'someFilter' };
      const res = makeResource();
      await act(async () => {
        render(makeTree({ ds }));
      });

      await act(async () => {
        await ctx().requestRelatedResource(res, 'ds');
      });

      expect(expr.assign).toHaveBeenCalledWith('root', res);
    });
  });
});
