import { test, expect } from '@playwright/test';
import { generatePodList, LARGE_LIST_SIZE } from './helpers/fixtures.js';
import {
  median,
  isValidMeasurement,
  aggregateScenario,
} from './helpers/aggregate.js';
import { buildReport, toMarkdown, writeReport } from './helpers/report.js';
import { measureUntil, getSampleCount } from './helpers/measure.js';
import { installPodRoutes } from './helpers/routes.js';
import { mkdtempSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

test.describe('fixtures', () => {
  test('generatePodList produces the requested count deterministically', () => {
    const a = generatePodList(5);
    const b = generatePodList(5);
    expect(a.items).toHaveLength(5);
    expect(a.kind).toBe('PodList');
    expect(a.items[0].metadata.name).toBe('perf-pod-0000');
    expect(a).toEqual(b); // deterministic
  });

  test('LARGE_LIST_SIZE is 1000', () => {
    expect(LARGE_LIST_SIZE).toBe(1000);
    expect(generatePodList(LARGE_LIST_SIZE).items).toHaveLength(1000);
  });
});

test.describe('aggregate', () => {
  test('median handles odd and even lengths', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
  });

  test('isValidMeasurement rejects bad values', () => {
    expect(isValidMeasurement(12.5)).toBe(true);
    expect(isValidMeasurement(0)).toBe(false);
    expect(isValidMeasurement(-1)).toBe(false);
    expect(isValidMeasurement(NaN)).toBe(false);
    expect(isValidMeasurement(undefined)).toBe(false);
    expect(isValidMeasurement('5')).toBe(false);
  });

  test('aggregateScenario computes medians and flags invalid samples', () => {
    const r = aggregateScenario('x', {
      cold: { load: [100, 200, 300] },
      warm: { load: [10, 0, 30] },
    });
    expect(r.cold.load.median).toBe(200);
    expect(r.warm.load.median).toBe(20); // median of valid [10,30]
    expect(r.invalid).toContain('warm.load[1]');
  });
});

test.describe('report', () => {
  const sampleScenario = {
    name: 'resource-list',
    cold: { load: { samples: [100, 200, 300], median: 200 } },
    warm: { load: { samples: [10, 20, 30], median: 20 } },
    invalid: [],
  };
  const meta = {
    buildVersion: 'abc123',
    browserVersion: 'chromium-1.60',
    sampleCount: 3,
    datasetSizes: { 'resource-list': 1000 },
  };

  test('buildReport nests meta and scenarios', () => {
    const r = buildReport({ scenarios: [sampleScenario], meta });
    expect(r.meta.buildVersion).toBe('abc123');
    expect(r.scenarios[0].name).toBe('resource-list');
  });

  test('toMarkdown renders medians and dataset sizes', () => {
    const md = toMarkdown(buildReport({ scenarios: [sampleScenario], meta }));
    expect(md).toContain('resource-list');
    expect(md).toContain('200'); // cold median
    expect(md).toContain('1000'); // dataset size
  });

  test('writeReport scrubs credentials and writes both files', () => {
    const dir = mkdtempSync(join(tmpdir(), 'perf-'));
    const r = buildReport({
      scenarios: [sampleScenario],
      meta: {
        ...meta,
        token: 'SECRET-TOKEN',
        secretNote: 'LEAK-CANARY',
        buildVersion: 'BUILD-CANARY',
      },
    });
    const { jsonPath, mdPath } = writeReport(r, dir);
    const json = readFileSync(jsonPath, 'utf8');
    const md = readFileSync(mdPath, 'utf8');
    // JSON scrub removes token key
    expect(json).not.toContain('SECRET-TOKEN');
    // Markdown: allowlist prevents non-rendered fields from leaking
    expect(md).not.toContain('LEAK-CANARY'); // proves allowlist, not serializing raw meta
    // Markdown: allowlist actually renders allowlisted fields
    expect(md).toContain('BUILD-CANARY'); // proves rendering happens
    expect(md).toContain('resource-list');
  });
});

test.describe('measure', () => {
  test('getSampleCount defaults to 3 and respects env', () => {
    const prev = process.env.PERF_SAMPLES;
    delete process.env.PERF_SAMPLES;
    expect(getSampleCount()).toBe(3);
    process.env.PERF_SAMPLES = '5';
    expect(getSampleCount()).toBe(5);
    if (prev === undefined) delete process.env.PERF_SAMPLES;
    else process.env.PERF_SAMPLES = prev;
  });

  test('measureUntil records a positive elapsed time once ready predicate holds', async ({
    page,
  }) => {
    await page.goto('data:text/html,<body></body>');
    const ms = await measureUntil(page, {
      action: async () => {
        await page.evaluate(() => {
          setTimeout(() => {
            window.__ready = true;
          }, 150);
        });
      },
      readyScript: 'window.__ready === true',
    });
    expect(ms).toBeGreaterThan(100);
  });

  test('measureUntil throws if predicate never holds', async ({ page }) => {
    await page.goto('data:text/html,<body></body>');
    await expect(
      measureUntil(page, {
        action: async () => {},
        readyScript: 'window.__never === true',
        timeoutMs: 1000,
      }),
    ).rejects.toThrow(/readiness/i);
  });
});

test.describe('routes', () => {
  test('installPodRoutes fulfils pod list requests from the generator', async ({
    page,
  }) => {
    await installPodRoutes(page, { count: 7 });
    // Use absolute URL via ADDRESS constant to establish origin context
    await page.goto('data:text/html,<body></body>');
    const body = await page.evaluate(async () => {
      const res = await fetch('http://localhost:8080/backend/api/v1/pods');
      return res.json();
    });
    expect(body.items).toHaveLength(7);
    expect(body.items[0].metadata.name).toBe('perf-pod-0000');
  });

  test('installPodRoutes honours delayMs', async ({ page }) => {
    await installPodRoutes(page, { count: 1, delayMs: 300 });
    await page.goto('data:text/html,<body></body>');
    const elapsed = await page.evaluate(async () => {
      const t0 = performance.now();
      await (await fetch('http://localhost:8080/backend/api/v1/pods')).json();
      return performance.now() - t0;
    });
    expect(elapsed).toBeGreaterThan(250);
  });
});
