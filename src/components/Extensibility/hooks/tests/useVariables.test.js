import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { extractVariables, useVariables } from '../useVariables';
import { VarStoreContext } from '../../contexts/VarStore';

// We want to control what jsonata.async returns in each test.
let mockJsonataAsyncImpl = vi.fn().mockResolvedValue([null, null]);

vi.mock('../useJsonata', () => ({
  useJsonata: () => {
    const fn = vi.fn();
    fn.async = (...args) => mockJsonataAsyncImpl(...args);
    return fn;
  },
}));

function makeVarStoreWrapper(initialVars = {}) {
  const setVar = vi.fn();
  const setVarsSpy = vi.fn((update) => {
    if (typeof update === 'function') {
      Object.assign(contextValue.vars, update(contextValue.vars));
    } else {
      Object.assign(contextValue.vars, update);
    }
  });

  const contextValue = {
    vars: { ...initialVars },
    setVar,
    setVars: setVarsSpy,
  };

  return {
    wrapper: ({ children }) =>
      createElement(
        VarStoreContext.Provider,
        { value: contextValue },
        children,
      ),
    contextValue,
    setVarsSpy,
  };
}

describe('extractVariables', () => {
  it('returns the full varStore when indexes is empty', () => {
    const store = { a: [10, 20], b: [30, 40] };
    expect(extractVariables(store, ['a', 'b'], [])).toBe(store);
  });

  it('extracts indexed values for listed var names', () => {
    const store = { color: ['red', 'green'], size: ['small', 'large'] };
    const result = extractVariables(store, ['color', 'size'], [1]);
    expect(result).toEqual({ color: 'green', size: 'large' });
  });

  it('extracts nested values with multiple indexes', () => {
    const store = {
      matrix: [
        [1, 2],
        [3, 4],
      ],
    };
    const result = extractVariables(store, ['matrix'], [1, 0]);
    expect(result).toEqual({ matrix: 3 });
  });

  it('returns empty object when vars list is empty', () => {
    const store = { x: [1, 2] };
    expect(extractVariables(store, [], [0])).toEqual({});
  });

  it('returns undefined for a var name when index path does not exist', () => {
    const store = { x: [1, 2] };
    const result = extractVariables(store, ['x'], [5]);
    expect(result).toEqual({ x: undefined });
  });

  it('returns empty object when vars is null/falsy', () => {
    const store = { x: [1] };
    expect(extractVariables(store, null, [0])).toEqual({});
  });
});

describe('useVariables return shape', () => {
  it('exposes vars, setVar, itemVars, prepareVars, readVars', () => {
    const { wrapper } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });
    expect(result.current).toMatchObject({
      vars: expect.any(Object),
      setVar: expect.any(Function),
      itemVars: expect.any(Function),
      prepareVars: expect.any(Function),
      readVars: expect.any(Function),
    });
  });

  it('reflects initial vars from context', () => {
    const { wrapper } = makeVarStoreWrapper({ foo: 'bar' });
    const { result } = renderHook(() => useVariables(), { wrapper });
    expect(result.current.vars).toEqual({ foo: 'bar' });
  });
});

describe('prepareVars', () => {
  it('collects var-tagged rules and nested children into defs resolved by readVars', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([
        { var: 'myVar', path: 'spec.items', defaultValue: 'hello' },
        {
          path: 'spec.other',
          children: [{ var: 'nested', path: 'name', defaultValue: 'world' }],
        },
      ]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith).toMatchObject({ myVar: 'hello', nested: 'world' });
  });

  it('ignores rules that have neither var nor children, resulting in empty defs', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([{ path: 'spec.something' }]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    expect(setVarsSpy).toHaveBeenCalledWith({});
  });
});

describe('readVars', () => {
  beforeEach(() => {
    mockJsonataAsyncImpl = vi.fn().mockResolvedValue([null, null]);
  });

  it('resolves defaultValue for a simple var def', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([
        { var: 'greeting', path: '', defaultValue: 'hello' },
      ]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    expect(setVarsSpy).toHaveBeenCalled();
    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith).toMatchObject({ greeting: 'hello' });
  });

  it('resolves dynamicValue via jsonata.async', async () => {
    mockJsonataAsyncImpl = vi.fn().mockResolvedValue(['dynamic-result', null]);

    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([
        { var: 'computed', path: '', dynamicValue: '$resource.spec.name' },
      ]);
    });

    await act(async () => {
      await result.current.readVars({ spec: { name: 'anything' } });
    });

    expect(mockJsonataAsyncImpl).toHaveBeenCalled();
    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith).toMatchObject({ computed: 'dynamic-result' });
  });

  it('applies type default (boolean → false) when dynamicValue returns undefined', async () => {
    mockJsonataAsyncImpl = vi.fn().mockResolvedValue([undefined, null]);

    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    // dynamicValue → undefined → applyDefaults fires type default
    act(() => {
      result.current.prepareVars([
        { var: 'flag', path: '', dynamicValue: '$someExpr', type: 'boolean' },
      ]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith).toMatchObject({ flag: false });
  });

  it('applies type default (string → "") when value is undefined', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([{ var: 'label', path: '', type: 'string' }]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith).toMatchObject({ label: '' });
  });

  it('resolves to empty string when no defaultValue, dynamicValue, or path match', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([{ var: 'count', path: '', type: 'number' }]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    const calledWith = setVarsSpy.mock.calls[0][0];
    // no defaultValue / dynamicValue / path → readVar returns '' (literal fallback)
    expect(calledWith).toMatchObject({ count: '' });
  });

  it('overrides resolved vars with the variables array passed to readVars', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([
        { var: 'greeting', path: '', defaultValue: 'hello' },
      ]);
    });

    await act(async () => {
      await result.current.readVars({}, [
        { name: 'greeting', value: 'override' },
      ]);
    });

    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith).toMatchObject({ greeting: 'override' });
  });

  it('skips vars that already have a static value in the store (no dynamicValue)', async () => {
    const { wrapper, setVarsSpy } = makeVarStoreWrapper({
      existing: 'already-set',
    });
    const { result } = renderHook(() => useVariables(), { wrapper });

    act(() => {
      result.current.prepareVars([
        { var: 'existing', path: '', defaultValue: 'new-value' },
      ]);
    });

    await act(async () => {
      await result.current.readVars({});
    });

    expect(mockJsonataAsyncImpl).not.toHaveBeenCalled();
    const calledWith = setVarsSpy.mock.calls[0][0];
    expect(calledWith.existing).toBe('already-set');
  });
});

describe('itemVars', () => {
  it('returns merged vars with item, items, index, indexes', () => {
    const { wrapper } = makeVarStoreWrapper({ globalVar: 'g' });
    const { result } = renderHook(() => useVariables(), { wrapper });

    const resource = { spec: { replicas: [{ name: 'a' }, { name: 'b' }] } };
    // storeKeys represents a path like spec > replicas > 0
    const storeKeys = {
      toArray: () => ['spec', 'replicas', 0],
      slice: (_, end) => ({
        toArray: () => ['spec', 'replicas', 0].slice(0, end),
      }),
    };

    const vars = result.current.itemVars(resource, [], storeKeys);

    // index/indexes reflect the position in storeKeys where the numeric key sits
    expect(vars).toMatchObject({
      globalVar: 'g',
      item: { name: 'a' },
      index: 2,
      indexes: [2],
    });
  });

  it('falls back to resource as item when no numeric index found', () => {
    const { wrapper } = makeVarStoreWrapper();
    const { result } = renderHook(() => useVariables(), { wrapper });

    const resource = { metadata: { name: 'root' } };
    const storeKeys = {
      toArray: () => ['spec'],
      slice: (_, end) => ({ toArray: () => ['spec'].slice(0, end) }),
    };

    const vars = result.current.itemVars(resource, [], storeKeys);
    expect(vars.item).toEqual(resource);
    expect(vars.index).toBeUndefined();
    expect(vars.indexes).toEqual([]);
  });
});
