import {
  connectCluster,
  installPodRoutes,
  ADDRESS,
} from '../helpers/connect.js';
import { measureUntil, getSampleCount } from '../helpers/measure.js';

// Readiness: real cluster-overview content is present.
// - The cluster-stats section (aria-labelledby="cluster-stats-heading") must exist — it is always
//   rendered by ClusterStats, so its presence confirms the component has mounted.
// - At least one .counting-card must be visible — CountingCard components are rendered
//   conditionally only when API data (pods, nodes, etc.) has arrived; during the loading phase
//   these cards are absent from the DOM entirely, so this check is false during skeleton/loading.
// - No .ui5-illustrated-message or *skeleton* elements — guards against error / empty states.
const READY =
  '!!document.querySelector(\'[aria-labelledby="cluster-stats-heading"]\') && ' +
  "document.querySelectorAll('.counting-card').length > 0 && " +
  'document.querySelectorAll(\'.ui5-illustrated-message, [class*="skeleton"]\').length === 0';

export async function collectClusterOverview(browser) {
  const samples = getSampleCount();
  const cold = { ready: [] };
  const warm = { ready: [] };

  // Setup: run connectCluster once to get a valid storageState (localStorage with
  // cluster config). This runs in a throw-away context so each cold sample can get a
  // truly fresh context (empty HTTP cache) without re-running the connection wizard.
  const setupCtx = await browser.newContext();
  const setupPage = await setupCtx.newPage();
  await installPodRoutes(setupPage, { count: 3 });
  await connectCluster(setupPage);
  const overviewPath = new URL(setupPage.url()).pathname;
  const storageState = await setupCtx.storageState();
  await setupCtx.close();

  for (let i = 0; i < samples; i++) {
    // Cold: fresh context = empty HTTP cache + fresh JS runtime; cluster config
    // pre-seeded via storageState so we skip the connection UI flow.
    const ctx = await browser.newContext({ storageState });
    const page = await ctx.newPage();
    await installPodRoutes(page, { count: 3 });

    cold.ready.push(
      await measureUntil(page, {
        action: async () => page.goto(ADDRESS + overviewPath),
        readyScript: READY,
      }),
    );

    // Warm: same context (HTTP cache primed by the cold load), React still running.
    // Navigate to the Namespaces list via sidebar click (in-app React Router
    // navigation — no JS context teardown, no full page reload), then measure
    // the click back to the cluster overview.
    await page.locator('ui5-side-navigation-item[text="Namespaces"]').click();
    await page.waitForURL(/\/namespaces\/?$/, { timeout: 15000 });

    warm.ready.push(
      await measureUntil(page, {
        action: async () =>
          page
            .locator('ui5-side-navigation-item[text="Cluster Overview"]')
            .click(),
        readyScript: READY,
      }),
    );

    await ctx.close();
  }

  return { cold, warm };
}
