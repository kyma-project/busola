import { vi } from 'vitest';
import {
  getSortingFunction,
  applySortFormula,
  sortBy,
  asyncSort,
} from '../sortBy';

describe('getSortingFunction', () => {
  it('sorts numbers ascending', async () => {
    const jsonata = vi.fn(async (formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: 1 }, { val: 3 })).toBeLessThan(0);
    expect(await asyncFn({ val: 5 }, { val: 2 })).toBeGreaterThan(0);
    expect(await asyncFn({ val: 4 }, { val: 4 })).toBe(0);
  });

  it('sorts booleans (false < true)', async () => {
    const jsonata = vi.fn(async (formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: false }, { val: true })).toBeLessThan(0);
  });

  it('puts undefined aValue first', async () => {
    const jsonata = vi.fn(async (formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: undefined }, { val: 1 })).toBe(-1);
  });

  it('puts undefined bValue last', async () => {
    const jsonata = vi.fn(async (formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: 1 }, { val: undefined })).toBe(1);
  });

  it('sorts strings alphabetically', async () => {
    const jsonata = vi.fn(async (formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: 'apple' }, { val: 'banana' })).toBeLessThan(0);
    expect(await asyncFn({ val: 'zebra' }, { val: 'ant' })).toBeGreaterThan(0);
  });

  it('sorts ISO date strings chronologically', async () => {
    const jsonata = vi.fn(async (formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    const older = { val: '2023-01-01T00:00:00Z' };
    const newer = { val: '2024-06-01T00:00:00Z' };
    expect(await asyncFn(older, newer)).toBeLessThan(0);
    expect(await asyncFn(newer, older)).toBeGreaterThan(0);
  });

  it('returns 1 when aValue is a string and bValue is undefined', async () => {
    const jsonata = vi.fn(async (_formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: 'hello' }, { val: undefined })).toBe(1);
  });

  it('returns 0 for equal strings', async () => {
    const jsonata = vi.fn(async (_formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    expect(await asyncFn({ val: 'same' }, { val: 'same' })).toBe(0);
  });

  it('returns 0 for equal ISO date strings', async () => {
    const jsonata = vi.fn(async (_formula, { scope }) => [scope.val]);
    const { asyncFn } = getSortingFunction(jsonata, 'val');

    const date = '2024-01-01T00:00:00Z';
    expect(await asyncFn({ val: date }, { val: date })).toBe(0);
  });
});

describe('applySortFormula', () => {
  it('returns undefined when a is undefined', async () => {
    const jsonata = vi.fn();
    const fn = applySortFormula(jsonata, 'formula');
    expect(await fn(undefined, 'b')).toBe(-1);
  });

  it('returns 1 when b is undefined', async () => {
    const jsonata = vi.fn();
    const fn = applySortFormula(jsonata, 'formula');
    expect(await fn('a', undefined)).toBe(1);
  });

  it('calls jsonata and returns first element of result', async () => {
    const jsonata = vi.fn(() => [42]);
    const fn = applySortFormula(jsonata, 'myFormula');
    const result = await fn('aVal', 'bVal');
    expect(result).toBe(42);
    expect(jsonata).toHaveBeenCalledWith('myFormula', {
      scope: { first: 'aVal', second: 'bVal' },
      first: 'aVal',
      second: 'bVal',
    });
  });

  it('works correctly when jsonata returns a Promise (async jsonata)', async () => {
    const jsonata = vi.fn(async () => [99]);
    const fn = applySortFormula(jsonata, 'myFormula');
    const result = await fn('aVal', 'bVal');
    expect(result).toBe(99);
  });
});

describe('sortBy', () => {
  const t = (key, { defaultValue } = {}) => defaultValue ?? key;

  it('returns an empty object when sortOptions is empty', () => {
    const jsonata = vi.fn();
    expect(sortBy(jsonata, [], t)).toEqual({});
  });

  it('returns an empty object when sortOptions is null/undefined', () => {
    const jsonata = vi.fn();
    expect(sortBy(jsonata, null, t)).toEqual({});
  });

  it('builds a sorting entry for a plain source option', () => {
    const jsonata = vi.fn();
    const options = [{ name: 'Name', source: 'metadata.name', sort: {} }];
    const result = sortBy(jsonata, options, t);
    expect(result).toHaveProperty('Name');
    expect(typeof result['Name'].asyncFn).toBe('function');
  });

  it('puts sort.default entries before regular ones (leading keys)', () => {
    const jsonata = vi.fn();
    const options = [
      { name: 'Regular', source: 'x', sort: {} },
      { name: 'Default', source: 'y', sort: { default: true } },
    ];
    const result = sortBy(jsonata, options, t);
    const keys = Object.keys(result);
    expect(keys.indexOf('Default')).toBeLessThan(keys.indexOf('Regular'));
  });

  it('uses a custom compareFunction when provided', async () => {
    // applySortFormula calls jsonata(...)[0] synchronously, so the mock must be sync
    const jsonata = vi.fn((formula, { scope } = {}) => {
      if (formula === 'mySource') return [scope?.val];
      if (formula === 'myCompare') return [1];
      return [undefined];
    });
    const options = [
      {
        name: 'Custom',
        source: 'mySource',
        sort: { compareFunction: 'myCompare' },
      },
    ];
    const result = sortBy(jsonata, options, t);
    const sortResult = await result['Custom'].asyncFn({ val: 1 }, { val: 2 });
    expect(sortResult).toBe(1);
  });

  it('merges defaultSortOptions between default and regular entries', () => {
    const jsonata = vi.fn();
    const options = [{ name: 'A', source: 'a', sort: {} }];
    const defaultSortOptions = { B: { asyncFn: vi.fn() } };
    const result = sortBy(jsonata, options, t, defaultSortOptions);
    expect(result).toHaveProperty('A');
    expect(result).toHaveProperty('B');
  });
});

describe('asyncSort', () => {
  it('sorts an array of numbers ascending', async () => {
    const asyncFn = async (a, b) => a - b;
    const result = await asyncSort([3, 1, 2], asyncFn);
    expect(result).toEqual([1, 2, 3]);
  });

  it('sorts an array of numbers descending when isDesc=true', async () => {
    const asyncFn = async (a, b) => a - b;
    const result = await asyncSort([1, 3], asyncFn, true);
    expect(result).toEqual([3, 1]);
  });

  it('handles an already-sorted array', async () => {
    const asyncFn = async (a, b) => a - b;
    const result = await asyncSort([1, 2, 3], asyncFn);
    expect(result).toEqual([1, 2, 3]);
  });

  it('handles a single-element array', async () => {
    const asyncFn = async (a, b) => a - b;
    const result = await asyncSort([42], asyncFn);
    expect(result).toEqual([42]);
  });

  it('handles an empty array', async () => {
    const asyncFn = async (a, b) => a - b;
    const result = await asyncSort([], asyncFn);
    expect(result).toEqual([]);
  });

  it('correctly sorts a larger array (regression: fake-sort missed pairs)', async () => {
    const asyncFn = async (a, b) => a - b;
    const input = [8, 3, 7, 1, 5, 2, 9, 4, 6, 10];
    const result = await asyncSort(input, asyncFn);
    expect(result).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('correctly sorts a larger array descending', async () => {
    const asyncFn = async (a, b) => a - b;
    const input = [8, 3, 7, 1, 5, 2, 9, 4, 6, 10];
    const result = await asyncSort(input, asyncFn, true);
    expect(result).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1]);
  });
});
