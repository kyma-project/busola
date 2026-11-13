import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { chromium } from 'playwright';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

import { extractMetrics } from './lib/metrics.js';
import {
  resolveRevision,
  resolveSampleCount,
  collectToolVersions,
  buildPageReport,
  buildSampleReport,
  buildSummary,
  writeSummary,
  sanitizeReports,
  assertNoSecrets,
} from './lib/report.js';

const require = createRequire(import.meta.url);

const ADDRESS = process.env.LOCAL
  ? 'http://localhost:8080'
  : 'http://localhost:3001';
const REPORT_DIR = 'test-results/lighthouse-performance';
const KUBECONFIG_FIXTURE = './fixtures/kubeconfig.yaml';
const AUTH_KEYS = {
  clusters: 'busola.clusters',
  current: 'busola.current-cluster-name',
};
const DEBUG_PORT = 9222;
const METRIC_KEYS = ['fcp', 'lcp', 'tbt', 'cls', 'performanceScore'];

const PERF_SETTINGS = {
  formFactor: 'desktop',
  screenEmulation: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
    disabled: false,
  },
  throttlingMethod: 'simulate',
  throttling: {
    rttMs: 40,
    throughputKbps: 10240,
    cpuSlowdownMultiplier: 1,
    requestLatencyMs: 0,
    downloadThroughputKbps: 0,
    uploadThroughputKbps: 0,
  },
};

const PERF_CONFIG = {
  extends: 'lighthouse:default',
  settings: { onlyCategories: ['performance'], ...PERF_SETTINGS },
};

const SAMPLES = resolveSampleCount(process.env.LIGHTHOUSE_SAMPLES);

const toolVersions = (lighthouseVersion) =>
  collectToolVersions({
    lighthouseVersion,
    playwrightVersion: require('@playwright/test/package.json').version,
    nodeVersion: process.version,
  });

const collectKubeconfigSecrets = (raw) => {
  const secrets = [];
  const re =
    /(?:token|client-certificate-data|client-key-data|certificate-authority-data|password):\s*("?)([^\s"]+)\1/g;
  let match;
  while ((match = re.exec(raw)) !== null) {
    secrets.push(match[2]);
  }
  return secrets;
};

// Connect the k3d cluster once through the UI and capture the resulting
// localStorage auth so every sample restores the exact same state.
async function captureAuthState() {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'busola-lh-setup-'));
  const context = await chromium.launchPersistentContext(profileDir, {
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
    ignoreHTTPSErrors: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(ADDRESS);
    await page.evaluate(() => window.localStorage.clear());
    await page.goto(ADDRESS + '/clusters');

    // Give the add-cluster wizard time to become interactive (matches the
    // existing accessibility spec).
    await page.waitForTimeout(5000);

    await page.locator('ui5-button:has-text("Connect"):visible').click();
    await page
      .locator('input[id="file-upload"]')
      .setInputFiles(KUBECONFIG_FIXTURE);
    await page.locator('ui5-button:has-text("Next Step"):visible').click();
    await page
      .locator(
        'ui5-radio-button:has-text("Local storage: Cluster data is persisted between browser reloads."):visible',
      )
      .click();
    await page.locator('ui5-button:has-text("Next Step"):visible').click();
    await page
      .locator(
        'ui5-button[accessible-name="last-step"]:has-text("Connect Cluster")',
      )
      .click();

    await expect(
      page.locator('ui5-title:has-text("Cluster Overview")'),
    ).toBeVisible();
    await page.waitForLoadState('networkidle');

    const authState = await page.evaluate(
      (keys) => ({
        clusters: window.localStorage.getItem(keys.clusters),
        current: window.localStorage.getItem(keys.current),
      }),
      AUTH_KEYS,
    );
    if (!authState.clusters || !authState.current) {
      throw new Error('failed to capture cluster auth state from localStorage');
    }
    return authState;
  } finally {
    await context.close();
  }
}

// Run one audit sample in an isolated browser profile with restored auth.
async function runSample({
  name,
  url,
  index,
  authState,
  verify,
  lhVersionRef,
}) {
  const profileDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `busola-lh-${name}-`),
  );
  const context = await chromium.launchPersistentContext(profileDir, {
    args: [`--remote-debugging-port=${DEBUG_PORT}`],
    ignoreHTTPSErrors: true,
  });
  try {
    const page = await context.newPage();
    await page.addInitScript(
      ({ keys, state }) => {
        if (state.clusters)
          window.localStorage.setItem(keys.clusters, state.clusters);
        if (state.current)
          window.localStorage.setItem(keys.current, state.current);
      },
      { keys: AUTH_KEYS, state: authState },
    );

    const client = await context.newCDPSession(page);
    await client.send('Network.clearBrowserCache');

    await page.goto(url);

    await verify(page);

    const result = await playAudit({
      page,
      port: DEBUG_PORT,
      thresholds: { performance: 0 }, // reporting-only: score never gates
      opts: { disableStorageReset: true },
      config: PERF_CONFIG,
      reports: {
        formats: { html: true },
        name: `${name}-sample-${index + 1}`,
        directory: REPORT_DIR,
      },
    });

    if (!lhVersionRef.value) {
      lhVersionRef.value = result.lhr.lighthouseVersion;
    }
    return extractMetrics(result.lhr);
  } finally {
    await context.close();
  }
}

test.describe.configure({ mode: 'serial' });

test('Busola performance audits (clusters + cluster overview)', async () => {
  test.setTimeout(SAMPLES * 2 * 90 * 1000 + 120 * 1000);
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const kubeconfigRaw = fs.readFileSync(KUBECONFIG_FIXTURE, 'utf8');
  const authState = await captureAuthState();
  const clusterName = authState.current;

  const secrets = [
    authState.clusters,
    kubeconfigRaw,
    ...collectKubeconfigSecrets(kubeconfigRaw),
  ];

  const settings = {
    ...PERF_SETTINGS,
    disableStorageReset: true,
    cacheCleared: true,
    samples: SAMPLES,
  };
  const lhVersionRef = { value: undefined };

  const pageDefs = [
    {
      name: 'clusters',
      url: `${ADDRESS}/clusters`,
      verify: async (page) => {
        await page.waitForLoadState('networkidle');
        await expect(
          page
            .locator(
              'ui5-button:has-text("Connect"), ui5-button:has-text("Add Cluster")',
            )
            .first(),
        ).toBeVisible();
        // Expected content: the connected cluster is listed.
        await expect(
          page.getByText(clusterName, { exact: false }).first(),
        ).toBeVisible();
      },
    },
    {
      name: 'cluster-overview',
      url: `${ADDRESS}/cluster/${encodeURIComponent(clusterName)}/overview`,
      verify: async (page) => {
        await expect(
          page.locator('ui5-title:has-text("Cluster Overview")'),
        ).toBeVisible();
        await page.waitForLoadState('networkidle');
        // Expected content: node data loaded ("Nodes (N)").
        await expect(page.getByText(/Nodes \(\d+\)/).first()).toBeVisible();
      },
    },
  ];

  try {
    const pages = [];
    for (const def of pageDefs) {
      const samples = [];
      for (let i = 0; i < SAMPLES; i++) {
        // eslint-disable-next-line no-await-in-loop -- samples are intentionally serial
        const metrics = await runSample({
          ...def,
          index: i,
          authState,
          lhVersionRef,
        });
        samples.push(metrics);
        const sampleReport = buildSampleReport({
          name: def.name,
          url: def.url,
          index: i + 1,
          revision: resolveRevision(process.env),
          toolVersions: toolVersions(lhVersionRef.value),
          settings,
          metrics,
        });
        fs.writeFileSync(
          path.join(REPORT_DIR, `${def.name}-sample-${i + 1}.sample.json`),
          JSON.stringify(sampleReport, null, 2),
        );
      }
      pages.push(buildPageReport({ name: def.name, url: def.url, samples }));
    }

    const summary = buildSummary({
      revision: resolveRevision(process.env),
      toolVersions: toolVersions(lhVersionRef.value),
      settings,
      pages,
      generatedAt: new Date().toISOString(),
    });
    writeSummary(summary, path.join(REPORT_DIR, 'summary.json'));

    // Guard: a valid result must have both pages, exactly SAMPLES samples each,
    // and finite medians for every reported metric.
    expect(summary.pages).toHaveLength(2);
    for (const reportedPage of summary.pages) {
      expect(reportedPage.samples).toHaveLength(SAMPLES);
      for (const key of METRIC_KEYS) {
        expect(Number.isFinite(reportedPage.median[key])).toBe(true);
      }
    }
  } finally {
    // Always scrub — a partial/failed run is still uploaded (CI uses
    // `if: always()`), so sanitization must not depend on the happy path.
    sanitizeReports({ directory: REPORT_DIR, secrets });
    // Fail the run if any credential survived redaction in an uploaded report.
    assertNoSecrets({ directory: REPORT_DIR, secrets });
  }
});
