import { describe, it, expect } from 'vitest';
import {
  eventSortComparators,
  eventInitialSort,
  eventSortByFn,
} from './eventSort';

describe('eventSort', () => {
  describe('lastseen comparator (natural ascending)', () => {
    const older = { lastTimestamp: '2020-01-01T00:00:00Z' };
    const newer = { lastTimestamp: '2020-01-02T00:00:00Z' };

    it('returns negative when a is older than b (ascending = oldest first)', () => {
      expect(eventSortComparators.lastseen(older, newer)).toBeLessThan(0);
    });

    it('returns positive when a is newer than b', () => {
      expect(eventSortComparators.lastseen(newer, older)).toBeGreaterThan(0);
    });

    it('sorts an array oldest-first in ascending order', () => {
      const sorted = [newer, older].sort(eventSortComparators.lastseen);
      expect(sorted).toEqual([older, newer]);
    });
  });

  describe('count comparator', () => {
    it('orders by count ascending and treats missing count as 0', () => {
      expect(
        eventSortComparators.count({ count: 1 }, { count: 5 }),
      ).toBeLessThan(0);
      expect(eventSortComparators.count({}, { count: 5 })).toBeLessThan(0);
    });
  });

  describe('eventInitialSort', () => {
    it('defaults to lastseen descending (newest first)', () => {
      expect(eventInitialSort).toEqual({ name: 'lastseen', order: 'DESC' });
    });
  });

  describe('eventSortByFn', () => {
    it('preserves the injected name comparator and adds event columns', () => {
      const nameFn = () => 0;
      const result = eventSortByFn({ name: nameFn });
      expect(result.name).toBe(nameFn);
      expect(Object.keys(result)).toEqual([
        'name',
        'type',
        'lastseen',
        'count',
      ]);
    });
  });
});
