import { describe, it, expect, vi, afterEach } from 'vitest';
import { createBoundedCache } from './bounded-cache.js';

describe('createBoundedCache', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and returns values, undefined on miss', () => {
    const cache = createBoundedCache();
    expect(cache.get('a')).toBeUndefined();
    cache.set('a', { v: 1 });
    expect(cache.get('a')).toEqual({ v: 1 });
    expect(cache.has('a')).toBe(true);
    expect(cache.has('b')).toBe(false);
  });

  it('evicts the oldest entry (FIFO) once max is reached', () => {
    const cache = createBoundedCache({ max: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3); // evicts 'a'
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBe(2);
    expect(cache.get('c')).toBe(3);
    expect(cache.size).toBe(2);
  });

  it('does not evict when overwriting an existing key', () => {
    const cache = createBoundedCache({ max: 2 });
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('a', 11); // overwrite, no eviction
    expect(cache.get('a')).toBe(11);
    expect(cache.get('b')).toBe(2);
  });

  it('expires entries after ttlMs', () => {
    vi.useFakeTimers();
    const cache = createBoundedCache({ ttlMs: 1000 });
    cache.set('a', 1);
    vi.advanceTimersByTime(999);
    expect(cache.get('a')).toBe(1);
    vi.advanceTimersByTime(1);
    expect(cache.get('a')).toBeUndefined();
    expect(cache.has('a')).toBe(false);
  });
});
