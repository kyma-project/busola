import { test, expect } from '@playwright/test';
import {
  connectCluster,
  installPodRoutes,
  ADDRESS,
} from '../helpers/connect.js';
import { measureUntil } from '../helpers/measure.js';

// Pod-specific readiness: rows rendered from the mocked 'perf-pod-' dataset.
const LOAD_READY =
  "document.querySelectorAll('ui5-table-row').length > 0 && " +
  "document.body.innerText.includes('perf-pod-')";

// A fresh cold connect + navigate to the pod list, returning the measured load ms.
// Because the session is fresh, the pod-list fetch is uncached, so a fixture
// delay is on the critical path to readiness.
async function coldLoad(page) {
  await page.context().clearCookies();
  await page.goto(ADDRESS);
  await page.evaluate(() => {
    localStorage.clear();
  });
  await connectCluster(page);
  const m = page.url().match(/\/cluster\/([^/?#]+)/);
  if (!m)
    throw new Error(`could not extract cluster name from URL: ${page.url()}`);
  const podsUrl = `${ADDRESS}/cluster/${m[1]}/namespaces/default/pods`;
  return measureUntil(page, {
    action: async () => page.goto(podsUrl),
    readyScript: LOAD_READY,
  });
}

// Self-test (DoD): proves the harness measures real app timing rather than a
// constant. The only difference between the two runs is a 1500ms delay injected
// into the fixture route, so the measured load must grow by (most of) that delay.
test('injected fixture delay increases measured timing', async ({ page }) => {
  // Throwaway warmup: without this the fast run is cold-JIT while the slow run
  // benefits from hot-compiled React paths, partially cancelling the injected delay.
  await installPodRoutes(page, { count: 50, delayMs: 0 });
  await coldLoad(page);

  await page.unroute('**/backend/**');
  await installPodRoutes(page, { count: 50, delayMs: 0 });
  const fast = await coldLoad(page);

  await page.unroute('**/backend/**');
  await installPodRoutes(page, { count: 50, delayMs: 1500 });
  const slow = await coldLoad(page);

  expect(
    slow,
    `slow (${slow}ms) should exceed fast (${fast}ms) by >1000ms (injected 1500ms delay)`,
  ).toBeGreaterThan(fast + 1000);
});
