import { describe, it, expect } from 'vitest';
import { AVAILABLE_PAGE_SIZES } from '../pageSizeAtom';

describe('AVAILABLE_PAGE_SIZES', () => {
  it('contains expected page sizes', () => {
    expect(AVAILABLE_PAGE_SIZES).toEqual([10, 20, 50]);
  });

  it('includes 20 as the default page size', () => {
    expect(AVAILABLE_PAGE_SIZES).toContain(20);
  });

  it('is sorted in ascending order', () => {
    const sorted = [...AVAILABLE_PAGE_SIZES].sort((a, b) => a - b);
    expect(AVAILABLE_PAGE_SIZES).toEqual(sorted);
  });
});
