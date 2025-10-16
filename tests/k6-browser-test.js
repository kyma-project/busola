import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { check } from 'k6';
import http from 'k6/http';
import exec from 'k6/execution';

// Define custom trends to collect frontend metrics
const LCP = new Trend('LCP');
const FCP = new Trend('FCP');
const TTI = new Trend('TTI');
const LOAD = new Trend('PageLoad');
const DOM_COMPLETE = new Trend('DOMComplete');

const BASE_URL = __ENV.BASE_URL ?? 'http://[::1]:8080'; // local frontend

export const options = {
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      vus: 1, // number of virtual browsers
      iterations: 1,
      options: {
        browser: {
          type: 'chromium', // uses real headless Chrome
        },
      },
    },
  },
  thresholds: {
    LCP: ['p(95)<2500'], // 95th percentile < 2.5s
    FCP: ['p(95)<1500'],
    TTI: ['p(95)<3000'],
    PageLoad: ['p(95)<4000'],
  },
};

export function setup() {
  const res = http.get(BASE_URL);
  console.log('Status:', res.status);
  if (res.status !== 200) {
    exec.test.abort(
      `Got unexpected status code ${res.status} when trying to setup. Exiting.`,
    );
  }
}

export default async function () {
  const page = await browser.newPage();

  try {
    const start = Date.now();

    // Change this URL to your deployed or local frontend
    await page.goto('http://[::1]:8080', { waitUntil: 'networkidle' });

    // Collect web vitals via Performance API
    const metrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');

      const fcp =
        paintEntries.find((e) => e.name === 'first-contentful-paint')
          ?.startTime || 0;
      const lcpEntry = performance
        .getEntriesByType('largest-contentful-paint')
        .pop();
      const lcp = lcpEntry?.startTime || 0;
      const tti = perfEntries.domInteractive || 0;
      const load = perfEntries.loadEventEnd - perfEntries.startTime;
      const domComplete = perfEntries.domComplete - perfEntries.startTime;

      return { fcp, lcp, tti, load, domComplete };
    });

    // Record metrics to k6 Trends
    FCP.add(metrics.fcp);
    LCP.add(metrics.lcp);
    TTI.add(metrics.tti);
    LOAD.add(metrics.load);
    DOM_COMPLETE.add(metrics.domComplete);

    // Optional: verify that important elements loaded
    const appRoot = await page.$('#root');
    check(appRoot, { 'App root is visible': (el) => el !== null });

    console.log(`Page loaded in ${(Date.now() - start).toFixed(0)} ms`);
    console.log(JSON.stringify(metrics, null, 2));
  } finally {
    await page.close();
  }
}
