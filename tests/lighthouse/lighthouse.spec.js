import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';
import lighthouse from 'lighthouse';
import { tmpdir } from 'os';

const ADDRESS = process.env.LOCAL
  ? 'http://localhost:8080'
  : 'http://localhost:3001';

// Target metrics
const THRESHOLDS = {
  accessibility: 80,
  'best-practices': 90,
  performance: 20, // change to expected one
  'first-contentful-paint': 120000, // change to proper one
  'largest-contentful-paint': 240000, // change to proper one
  'speed-index': 120000, // change to proper one
  interactive: 240000, // change to proper one
  'total-blocking-time': 300,
  'cumulative-layout-shift': 0.1,
};

// Metrics where higher value is better
const HIGHER_BETTER = ['accessibility', 'best-practices', 'performance'];
// Metrics where lower value is better
const LOWER_BETTER = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'interactive',
  'total-blocking-time',
  'cumulative-layout-shift',
];

async function runLighthouseAudit(url, port) {
  const result = await lighthouse(url, {
    port,
    output: 'json',
    logLevel: 'info',
  });

  const lhr = result.lhr;

  // Extract all metrics
  const metrics = {
    accessibility: lhr.categories.accessibility.score * 100,
    'best-practices': lhr.categories['best-practices'].score * 100,
    performance: lhr.categories.performance.score * 100,
    'first-contentful-paint': lhr.audits['first-contentful-paint'].numericValue,
    'largest-contentful-paint':
      lhr.audits['largest-contentful-paint'].numericValue,
    'speed-index': lhr.audits['speed-index'].numericValue,
    interactive: lhr.audits['interactive'].numericValue,
    'total-blocking-time': lhr.audits['total-blocking-time'].numericValue,
    'cumulative-layout-shift':
      lhr.audits['cumulative-layout-shift'].numericValue,
  };

  return metrics;
}

function checkThresholds(metrics) {
  for (const key in THRESHOLDS) {
    const actual = metrics[key];
    const target = THRESHOLDS[key];

    if (HIGHER_BETTER.includes(key)) {
      if (actual < target) {
        throw new Error(
          `${key} is ${actual} and below the threshold of ${target}`,
        );
      }
    } else if (LOWER_BETTER.includes(key)) {
      if (actual > target) {
        throw new Error(
          `${key} is ${actual} and above the threshold of ${target}`,
        );
      }
    } else {
      console.warn(`No comparison rule for metric ${key}`);
    }
  }
}

test('Busola Lighthouse full audit', async () => {
  const context = await chromium.launchPersistentContext(tmpdir(), {
    args: ['--remote-debugging-port=9222'],
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // clear localStorage data
  await page.goto(ADDRESS);
  await page.evaluate(() => window.localStorage.clear());

  // Navigate to clusters page
  await page.goto(ADDRESS + '/clusters');

  console.log('Running Lighthouse audit on /clusters...');
  const metrics = await runLighthouseAudit(ADDRESS + '/clusters', 9222);
  console.log(metrics);
  checkThresholds(metrics);

  // Cluster setup steps
  await page.evaluate(() => new Promise((r) => setTimeout(r, 5000)));
  await page.locator('ui5-button:has-text("Connect"):visible').click();
  await page
    .locator('input[id="file-upload"]')
    .setInputFiles('./fixtures/kubeconfig.yaml');

  await page.locator('ui5-button:has-text("Next Step"):visible').click();

  await page
    .locator(
      'ui5-radio-button:has-text("Local storage: Cluster data is persisted between browser reloads."):visible',
    )
    .click();

  await page.locator('ui5-button:has-text("Next Step"):visible').click();

  await page
    .locator(
      'ui5-button[accessible-name="last-step"]:has-text("Connect cluster")',
    )
    .click();

  await expect(
    page.locator('.ui5-sn-list-li:has-text("Cluster Details")'),
  ).toBeVisible();

  console.log('Running Lighthouse audit on cluster details...');
  const clusterMetrics = await runLighthouseAudit(ADDRESS + '/clusters', 9222);
  console.log(clusterMetrics);
  checkThresholds(clusterMetrics);

  await context.close();
});

/* This test can be used to gather frontend performance metrics like memory usage and interaction latency.
import { test, expect } from '@playwright/test';

test('Busola frontend performance', async ({ page }) => {
  await page.goto('http://localhost:3001/clusters', { waitUntil: 'networkidle' });

  // Capture basic browser metrics
  const metrics = await page.metrics();
  console.log('Frontend metrics:', metrics);

  // Evaluate JS memory usage (if supported)
  const memory = await page.evaluate(() => performance.memory || {});
  console.log('Memory usage:', memory);

  // Measure interaction latency
  const t0 = Date.now();
  await page.click('ui5-button:has-text("Connect")');
  await page.waitForSelector('.ui5-modal-root', { state: 'visible' });
  const interactionTime = Date.now() - t0;
  console.log(`Interaction latency: ${interactionTime} ms`);

  // Assertions (can be turned into thresholds)
  expect(interactionTime).toBeLessThan(1000);
});

*/
