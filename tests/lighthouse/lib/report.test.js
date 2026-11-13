import { describe, it, expect } from 'vitest';
import {
  resolveRevision,
  collectToolVersions,
  resolveSampleCount,
  buildPageReport,
  buildSummary,
} from './report.js';

describe('resolveRevision', () => {
  it('prefers GITHUB_SHA, then GIT_SHA, then unknown', () => {
    expect(resolveRevision({ GITHUB_SHA: 'a' })).toBe('a');
    expect(resolveRevision({ GIT_SHA: 'b' })).toBe('b');
    expect(resolveRevision({})).toBe('unknown');
  });
});

describe('resolveSampleCount', () => {
  it('defaults to 3', () => {
    expect(resolveSampleCount(undefined)).toBe(3);
  });
  it('parses a positive integer', () => {
    expect(resolveSampleCount('5')).toBe(5);
  });
  it.each(['0', '-1', 'abc', '2.5'])('throws on %s', (v) => {
    expect(() => resolveSampleCount(v)).toThrow();
  });
});

describe('collectToolVersions', () => {
  it('passes versions through with unknown fallback', () => {
    expect(
      collectToolVersions({
        lighthouseVersion: '13.3.0',
        playwrightVersion: '1.60.0',
      }),
    ).toEqual({ lighthouse: '13.3.0', playwright: '1.60.0', node: 'unknown' });
  });
});

describe('buildPageReport', () => {
  it('attaches the median and throws on no samples', () => {
    const m = (fcp) => ({ fcp, lcp: 1, tbt: 1, cls: 0, performanceScore: 90 });
    const r = buildPageReport({
      name: 'clusters',
      url: 'u',
      samples: [m(100), m(300), m(200)],
    });
    expect(r.median.fcp).toBe(200);
    expect(() =>
      buildPageReport({ name: 'x', url: 'u', samples: [] }),
    ).toThrow();
  });
});

describe('buildSummary', () => {
  it('includes metadata and throws on empty pages', () => {
    const summary = buildSummary({
      revision: 'sha',
      toolVersions: { lighthouse: '13' },
      settings: { samples: 3 },
      pages: [{ name: 'clusters', url: 'u', samples: [], median: {} }],
      generatedAt: 't',
    });
    expect(summary).toMatchObject({
      revision: 'sha',
      settings: { samples: 3 },
      generatedAt: 't',
    });
    expect(() =>
      buildSummary({
        revision: 'sha',
        toolVersions: {},
        settings: {},
        pages: [],
      }),
    ).toThrow();
  });
});
