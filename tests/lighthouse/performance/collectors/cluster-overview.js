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

export async function collectClusterOverview(page) {
  const samples = getSampleCount();
  const cold = { ready: [] };
  const warm = { ready: [] };
  await installPodRoutes(page, { count: 3 });
  for (let i = 0; i < samples; i++) {
    await page.context().clearCookies();
    await page.goto(ADDRESS);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await connectCluster(page);
    // After connectCluster the browser is already on the cluster overview.
    // Capture the URL (e.g. /cluster/k3d-perfCluster/overview) so we can
    // navigate back to it for measurements.
    const overviewUrl = page.url();

    // Cold: navigate from /clusters → overview (no HTTP-cache benefit; first visit).
    // performance.now() on the /clusters page is small (just loaded), so
    // measureUntil will record a positive elapsed value once overview content arrives.
    await page.goto(ADDRESS + '/clusters');
    cold.ready.push(
      await measureUntil(page, {
        action: async () => page.goto(overviewUrl),
        readyScript: READY,
      }),
    );

    // Warm: navigate from /clusters → overview again (browser HTTP-cache and JS module
    // cache are primed by the cold visit).  Using a fresh /clusters page as the source
    // keeps performance.now() small before capture, avoiding the cross-navigation clock
    // mismatch that page.reload() introduces (old-page perf.now() > new-page perf.now()
    // after reload ⇒ negative, invalid measurement).
    await page.goto(ADDRESS + '/clusters');
    warm.ready.push(
      await measureUntil(page, {
        action: async () => page.goto(overviewUrl),
        readyScript: READY,
      }),
    );
  }
  return { cold, warm };
}
