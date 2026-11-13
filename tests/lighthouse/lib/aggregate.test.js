import { describe, it, expect } from 'vitest';
import { median, summarizeSamples } from './aggregate.js';

describe('median', () => {
  it('returns the middle value for odd counts', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('averages the two middle values for even counts', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('throws on an empty array', () => {
    expect(() => median([])).toThrow();
  });

  it('throws on non-finite values', () => {
    expect(() => median([1, NaN])).toThrow();
  });
});

describe('summarizeSamples', () => {
  const s = (fcp, lcp, tbt, cls, performanceScore) => ({
    fcp,
    lcp,
    tbt,
    cls,
    performanceScore,
  });

  it('computes the per-metric median across samples', () => {
    expect(
      summarizeSamples([
        s(100, 200, 10, 0.01, 90),
        s(300, 400, 30, 0.03, 70),
        s(200, 300, 20, 0.02, 80),
      ]),
    ).toEqual(s(200, 300, 20, 0.02, 80));
  });

  it('throws on an empty sample set', () => {
    expect(() => summarizeSamples([])).toThrow();
  });

  it('throws when a sample is missing a metric', () => {
    expect(() =>
      summarizeSamples([{ fcp: 1, lcp: 2, tbt: 3, cls: 0.1 }]),
    ).toThrow();
  });
});
