import { describe, it, expect } from 'vitest';
import { median, summarizeSamples } from './aggregate';
import { validateSample, type RenderSample } from './metrics';
import {
  buildSampleReport,
  buildScenarioSummary,
  buildSummary,
} from './report';
import { generateEntries, type DatasetSize } from './fixtures';

// ---------------------------------------------------------------------------
// aggregate
// ---------------------------------------------------------------------------

describe('median', () => {
  it('returns the middle value of an odd-length sorted array', () => {
    expect(median([3, 1, 2])).toBe(2);
  });

  it('returns the average of the two middle values for even-length arrays', () => {
    expect(median([4, 1, 3, 2])).toBe(2.5);
  });

  it('handles a single element', () => {
    expect(median([42])).toBe(42);
  });

  it('throws on an empty array', () => {
    expect(() => median([])).toThrow('non-empty array');
  });

  it('throws when a value is NaN', () => {
    expect(() => median([1, NaN, 3])).toThrow('finite values');
  });

  it('throws when a value is Infinity', () => {
    expect(() => median([1, Infinity])).toThrow('finite values');
  });
});

describe('summarizeSamples', () => {
  const samples: RenderSample[] = [
    { actualDuration: 10, baseDuration: 20, browserDuration: 30, commitCount: 1 },
    { actualDuration: 20, baseDuration: 40, browserDuration: 60, commitCount: 2 },
    { actualDuration: 30, baseDuration: 60, browserDuration: 90, commitCount: 3 },
  ];

  it('returns median for each metric key', () => {
    const result = summarizeSamples(samples);
    expect(result.actualDuration).toBe(20);
    expect(result.baseDuration).toBe(40);
    expect(result.browserDuration).toBe(60);
    expect(result.commitCount).toBe(2);
  });

  it('returns all four metric keys', () => {
    const result = summarizeSamples(samples);
    expect(Object.keys(result).sort()).toEqual(
      ['actualDuration', 'baseDuration', 'browserDuration', 'commitCount'].sort(),
    );
  });

  it('throws on an empty sample set', () => {
    expect(() => summarizeSamples([])).toThrow('non-empty sample set');
  });
});

// ---------------------------------------------------------------------------
// metrics
// ---------------------------------------------------------------------------

describe('validateSample', () => {
  it('does not throw for a valid sample', () => {
    const sample: RenderSample = {
      actualDuration: 10,
      baseDuration: 5,
      browserDuration: 15,
      commitCount: 1,
    };
    expect(() => validateSample(sample)).not.toThrow();
  });

  it('allows zero values (legitimate fast renders)', () => {
    expect(() =>
      validateSample({ actualDuration: 0, baseDuration: 0, browserDuration: 0, commitCount: 0 }),
    ).not.toThrow();
  });

  it('throws when actualDuration is NaN', () => {
    expect(() =>
      validateSample({ actualDuration: NaN, baseDuration: 5, browserDuration: 10, commitCount: 1 }),
    ).toThrow('actualDuration');
  });

  it('throws when baseDuration is Infinity', () => {
    expect(() =>
      validateSample({ actualDuration: 10, baseDuration: Infinity, browserDuration: 10, commitCount: 1 }),
    ).toThrow('baseDuration');
  });

  it('throws when browserDuration is -Infinity', () => {
    expect(() =>
      validateSample({ actualDuration: 10, baseDuration: 5, browserDuration: -Infinity, commitCount: 1 }),
    ).toThrow('browserDuration');
  });

  it('throws when commitCount is NaN', () => {
    expect(() =>
      validateSample({ actualDuration: 10, baseDuration: 5, browserDuration: 15, commitCount: NaN }),
    ).toThrow('commitCount');
  });
});

// ---------------------------------------------------------------------------
// report builders (pure; writeSummary uses cy and is exercised in perf tests)
// ---------------------------------------------------------------------------

describe('buildSampleReport', () => {
  it('returns a correctly shaped report', () => {
    const sample: RenderSample = {
      actualDuration: 12,
      baseDuration: 8,
      browserDuration: 20,
      commitCount: 1,
    };
    const report = buildSampleReport('GenericList', 'mount', 'small', 0, 5, sample);
    expect(report.schema).toBe('busola-cypress-perf-sample');
    expect(report.component).toBe('GenericList');
    expect(report.scenario).toBe('mount');
    expect(report.datasetSize).toBe('small');
    expect(report.index).toBe(0);
    expect(report.settings.samples).toBe(5);
    expect(report.metrics).toEqual(sample);
  });
});

describe('buildScenarioSummary', () => {
  const samples: RenderSample[] = [
    { actualDuration: 5, baseDuration: 3, browserDuration: 8, commitCount: 1 },
    { actualDuration: 15, baseDuration: 9, browserDuration: 24, commitCount: 2 },
    { actualDuration: 10, baseDuration: 6, browserDuration: 16, commitCount: 1 },
  ];

  it('preserves scenario and datasetSize', () => {
    const summary = buildScenarioSummary('filter', 'medium', samples);
    expect(summary.scenario).toBe('filter');
    expect(summary.datasetSize).toBe('medium');
  });

  it('attaches the original samples array', () => {
    const summary = buildScenarioSummary('filter', 'medium', samples);
    expect(summary.samples).toBe(samples);
  });

  it('computes median values', () => {
    const summary = buildScenarioSummary('filter', 'medium', samples);
    expect(summary.median.actualDuration).toBe(10);
    expect(summary.median.baseDuration).toBe(6);
    expect(summary.median.browserDuration).toBe(16);
    expect(summary.median.commitCount).toBe(1);
  });
});

describe('buildSummary', () => {
  const scenario = buildScenarioSummary('mount', 'small', [
    { actualDuration: 10, baseDuration: 5, browserDuration: 15, commitCount: 1 },
  ]);

  it('returns a PerfSummary with the correct schema', () => {
    const summary = buildSummary('GenericList', { samples: 5 }, [scenario]);
    expect(summary.schema).toBe('busola-cypress-perf-summary');
  });

  it('includes component and settings', () => {
    const summary = buildSummary('GenericList', { samples: 5 }, [scenario]);
    expect(summary.component).toBe('GenericList');
    expect(summary.settings.samples).toBe(5);
  });

  it('sets generatedAt to a valid ISO string', () => {
    const summary = buildSummary('GenericList', { samples: 5 }, [scenario]);
    expect(() => new Date(summary.generatedAt)).not.toThrow();
    expect(new Date(summary.generatedAt).toISOString()).toBe(summary.generatedAt);
  });

  it('throws when given no scenarios', () => {
    expect(() => buildSummary('GenericList', { samples: 5 }, [])).toThrow(
      'at least one scenario',
    );
  });
});

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------

describe('generateEntries', () => {
  const cases: Array<[DatasetSize, number]> = [
    ['small', 10],
    ['medium', 100],
    ['large', 1000],
  ];

  it.each(cases)('%s generates %i entries', (size, count) => {
    expect(generateEntries(size)).toHaveLength(count);
  });

  it('each entry has a unique uid', () => {
    const entries = generateEntries('small');
    const uids = entries.map(e => e.metadata.uid);
    expect(new Set(uids).size).toBe(entries.length);
  });

  it('each entry has required fields', () => {
    const [entry] = generateEntries('small');
    expect(entry).toHaveProperty('id');
    expect(entry).toHaveProperty('name');
    expect(entry).toHaveProperty('type');
    expect(entry.metadata).toHaveProperty('namespace');
    expect(entry.metadata).toHaveProperty('uid');
    expect(entry.metadata).toHaveProperty('creationTimestamp');
    expect(entry.metadata).toHaveProperty('labels');
    expect(Object.keys(entry.metadata.labels).length).toBeGreaterThanOrEqual(3);
  });
});
