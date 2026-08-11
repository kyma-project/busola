import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useJsonata } from '../useJsonata';
import {
  DataSourcesContext,
  DataSourcesContextType,
  DataSource,
  Resource,
} from '../../contexts/DataSources';
import { createElement, ReactNode } from 'react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { error?: string }) =>
      opts?.error ? `config-error: ${opts.error}` : key,
  }),
}));

vi.mock('../../helpers/jsonataWrapper', () => ({
  jsonataWrapper: vi.fn((query: string) => ({
    evaluate: vi.fn(
      async (scope: Resource | null, bindings: Record<string, any>) => {
        if (query === '$name') return scope?.metadata?.name ?? null;
        if (query === '$root.metadata.name')
          return bindings?.root?.metadata?.name ?? null;
        if (query === '$parent.metadata.name')
          return bindings?.parent?.metadata?.name ?? null;
        if (query === '$item') return bindings?.item ?? null;
        if (query === '$items') return bindings?.items ?? null;
        if (query === '$call-ds') return bindings?.myDs?.();
        if (query === '$embedResource') return bindings?.embedResource ?? null;
        if (query === 'throw') throw new Error('bad query');
        return null;
      },
    ),
  })),
}));

const makeResource = (name = 'test-resource'): Resource => ({
  metadata: { name, namespace: 'default', labels: {}, annotations: {} },
  spec: {},
});

const defaultDataSourcesContext: DataSourcesContextType = {
  store: {},
  dataSources: {},
  getRelatedResourceInPath: vi.fn(),
  requestRelatedResource: vi.fn(),
};

function wrapper(
  contextValue: DataSourcesContextType = defaultDataSourcesContext,
) {
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(
      DataSourcesContext.Provider,
      { value: contextValue },
      children,
    );
  return Wrapper;
}

describe('useJsonata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic evaluation', () => {
    it('returns [defaultValue, null] when query is empty string', async () => {
      const { result } = renderHook(
        () => useJsonata({ resource: makeResource() }),
        {
          wrapper: wrapper(),
        },
      );
      const [value, error] = await result.current('', {}, 'fallback');
      expect(value).toBe('fallback');
      expect(error).toBeNull();
    });

    it('evaluates a simple query against the resource', async () => {
      const resource = makeResource('my-pod');
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(),
      });
      const [value, error] = await result.current('$name');
      expect(value).toBe('my-pod');
      expect(error).toBeNull();
    });

    it('returns [errorMessage, Error] when evaluation throws', async () => {
      const { result } = renderHook(
        () => useJsonata({ resource: makeResource() }),
        {
          wrapper: wrapper(),
        },
      );
      const [value, error] = await result.current('throw');
      expect(typeof value).toBe('string');
      expect((value as string).startsWith('config-error:')).toBe(true);
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('bindings', () => {
    it('exposes root binding as the resource', async () => {
      const resource = makeResource('root-resource');
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(),
      });
      const [value] = await result.current('$root.metadata.name');
      expect(value).toBe('root-resource');
    });

    it('exposes parent binding', async () => {
      const resource = makeResource('child');
      const parent = makeResource('parent-resource');
      const { result } = renderHook(() => useJsonata({ resource, parent }), {
        wrapper: wrapper(),
      });
      const [value] = await result.current('$parent.metadata.name');
      expect(value).toBe('parent-resource');
    });

    it('uses extras.resource as scope and root when provided', async () => {
      const resource = makeResource('original');
      const extrasResource = makeResource('overridden');
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(),
      });
      const [value] = await result.current('$name', {
        resource: extrasResource,
      });
      expect(value).toBe('overridden');
    });

    it('uses extras.scope as scope when provided', async () => {
      const resource = makeResource('original');
      const scope = makeResource('scoped');
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(),
      });
      const [value] = await result.current('$name', { scope });
      expect(value).toBe('scoped');
    });

    it('uses hook-level scope when no extras.scope or extras.resource given', async () => {
      const resource = makeResource('hook-resource');
      const hookScope = makeResource('hook-scope');
      const { result } = renderHook(
        () => useJsonata({ resource, scope: hookScope }),
        { wrapper: wrapper() },
      );
      const [value] = await result.current('$name');
      expect(value).toBe('hook-scope');
    });

    it('exposes items binding from hook arrayItems', async () => {
      const resource = makeResource();
      const arrayItems = [makeResource('item-a'), makeResource('item-b')];
      const { result } = renderHook(
        () => useJsonata({ resource, arrayItems }),
        {
          wrapper: wrapper(),
        },
      );
      const [value] = await result.current('$items');
      expect(value).toEqual(arrayItems);
    });

    it('extras.arrayItems overrides hook arrayItems for items binding', async () => {
      const resource = makeResource();
      const hookItems = [makeResource('hook-item')];
      const extrasItems = [makeResource('extras-item')];
      const { result } = renderHook(
        () => useJsonata({ resource, arrayItems: hookItems }),
        { wrapper: wrapper() },
      );
      const [value] = await result.current('$items', {
        arrayItems: extrasItems,
      });
      expect(value).toEqual(extrasItems);
    });

    it('item is the last element of arrayItems', async () => {
      const resource = makeResource();
      const arrayItems = [makeResource('first'), makeResource('last')];
      const { result } = renderHook(
        () => useJsonata({ resource, arrayItems }),
        {
          wrapper: wrapper(),
        },
      );
      const [value] = await result.current('$item');
      expect(value).toEqual(makeResource('last'));
    });

    it('item falls back to resource when no arrayItems', async () => {
      const resource = makeResource('fallback-item');
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(),
      });
      const [value] = await result.current('$item');
      expect(value).toEqual(resource);
    });

    it('exposes embedResource binding in sync path', async () => {
      const resource = makeResource('main');
      const embedResource = makeResource('embedded');
      const { result } = renderHook(
        () => useJsonata({ resource, embedResource }),
        { wrapper: wrapper() },
      );
      const [value] = await result.current('$embedResource');
      expect(value).toEqual(embedResource);
    });
  });

  describe('data source fetchers', () => {
    it('calls requestRelatedResource via value() fetcher during sync evaluation', async () => {
      const resource = makeResource();
      const requestRelatedResource = vi.fn().mockReturnValue('ds-data');
      const context: DataSourcesContextType = {
        ...defaultDataSourcesContext,
        dataSources: { myDs: {} as DataSource },
        store: {
          myDs: {
            loading: false,
            error: null,
            data: 'ds-data',
            firstFetch: null,
          },
        },
        requestRelatedResource,
      };
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(context),
      });
      // $call-ds invokes bindings.myDs() which goes through the value() fetcher
      await result.current('$call-ds');
      expect(requestRelatedResource).toHaveBeenCalledWith(resource, 'myDs');
    });
  });

  describe('jsonata.async', () => {
    it('returns [defaultValue, null] when query is empty', async () => {
      const { result } = renderHook(
        () => useJsonata({ resource: makeResource() }),
        {
          wrapper: wrapper(),
        },
      );
      const [value, error] = await result.current.async(
        '',
        {},
        'async-default',
      );
      expect(value).toBe('async-default');
      expect(error).toBeNull();
    });

    it('calls requestRelatedResource via fetcher binding during async evaluation', async () => {
      const resource = makeResource();
      const requestRelatedResource = vi.fn().mockReturnValue('ds-data');
      const context: DataSourcesContextType = {
        ...defaultDataSourcesContext,
        dataSources: { myDs: {} as DataSource },
        store: {
          myDs: {
            loading: false,
            error: null,
            data: 'ds-data',
            firstFetch: null,
          },
        },
        requestRelatedResource,
      };
      const { result } = renderHook(() => useJsonata({ resource }), {
        wrapper: wrapper(context),
      });
      await result.current.async('$call-ds');
      expect(requestRelatedResource).toHaveBeenCalledWith(resource, 'myDs');
    });

    it('returns [errorMessage, Error] on evaluation failure', async () => {
      const { result } = renderHook(
        () => useJsonata({ resource: makeResource() }),
        {
          wrapper: wrapper(),
        },
      );
      const [value, error] = await result.current.async('throw');
      expect(typeof value).toBe('string');
      expect(error).toBeInstanceOf(Error);
    });

    it('exposes embedResource binding in async path', async () => {
      const resource = makeResource('main');
      const embedResource = makeResource('embedded');
      const { result } = renderHook(
        () => useJsonata({ resource, embedResource }),
        { wrapper: wrapper() },
      );
      const [value] = await result.current.async('$embedResource');
      expect(value).toEqual(embedResource);
    });

    it('returns [errorMessage, non-Error] for non-Error throws', async () => {
      const { jsonataWrapper } = await import('../../helpers/jsonataWrapper');
      vi.mocked(jsonataWrapper).mockImplementationOnce(
        () =>
          ({
            evaluate: async () => {
              throw 'string-error';
            },
          }) as any,
      );
      const { result } = renderHook(
        () => useJsonata({ resource: makeResource() }),
        {
          wrapper: wrapper(),
        },
      );
      const [value, error] = await result.current.async('$name');
      expect(typeof value).toBe('string');
      expect(error).toBe('string-error');
    });
  });
});
