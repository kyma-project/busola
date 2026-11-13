import { describe, it, expect } from 'vitest';
import { extractMetrics, PERFORMANCE_AUDIT_KEYS } from './metrics.js';

const goodLhr = () => ({
  runtimeError: undefined,
  categories: { performance: { score: 0.87 } },
  audits: {
    'first-contentful-paint': {
      numericValue: 1200.4,
      scoreDisplayMode: 'numeric',
    },
    'largest-contentful-paint': {
      numericValue: 2500,
      scoreDisplayMode: 'numeric',
    },
    'total-blocking-time': { numericValue: 150, scoreDisplayMode: 'numeric' },
    'cumulative-layout-shift': {
      numericValue: 0.02,
      scoreDisplayMode: 'numeric',
    },
  },
});

describe('extractMetrics', () => {
  it('maps audits and scales the score to 0-100', () => {
    expect(extractMetrics(goodLhr())).toEqual({
      fcp: 1200.4,
      lcp: 2500,
      tbt: 150,
      cls: 0.02,
      performanceScore: 87,
    });
  });

  it('throws on a Lighthouse runtime error', () => {
    const lhr = goodLhr();
    lhr.runtimeError = { code: 'NO_FCP' };
    expect(() => extractMetrics(lhr)).toThrow();
  });

  it('throws when the performance category is missing', () => {
    const lhr = goodLhr();
    delete lhr.categories.performance;
    expect(() => extractMetrics(lhr)).toThrow();
  });

  it('throws when an audit is in the error state', () => {
    const lhr = goodLhr();
    lhr.audits['largest-contentful-paint'] = {
      numericValue: null,
      scoreDisplayMode: 'error',
    };
    expect(() => extractMetrics(lhr)).toThrow();
  });

  it('throws when a numericValue is missing or NaN', () => {
    const lhr = goodLhr();
    lhr.audits['total-blocking-time'].numericValue = undefined;
    expect(() => extractMetrics(lhr)).toThrow();
    const lhr2 = goodLhr();
    lhr2.audits['cumulative-layout-shift'].numericValue = NaN;
    expect(() => extractMetrics(lhr2)).toThrow();
  });

  it('throws when the score is out of range', () => {
    const lhr = goodLhr();
    lhr.categories.performance.score = null;
    expect(() => extractMetrics(lhr)).toThrow();
  });

  it('exposes the four web-vitals audit keys', () => {
    expect(Object.keys(PERFORMANCE_AUDIT_KEYS)).toEqual([
      'fcp',
      'lcp',
      'tbt',
      'cls',
    ]);
  });
});
