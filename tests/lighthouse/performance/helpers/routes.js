import { generatePodList } from './fixtures.js';

export const ADDRESS = process.env.LOCAL
  ? 'http://localhost:8080'
  : 'http://localhost:3001';

const POD_LIST_RE = /\/backend\/api\/v1\/(namespaces\/[^/]+\/)?pods(\?|$)/;
const SINGLE_POD_RE =
  /\/backend\/api\/v1\/namespaces\/[^/]+\/pods\/([^/?]+)(\?|$)/;

/**
 * Intercept browser->backend pod-list calls and fulfil them from a deterministic
 * generated list. delayMs lets the self-test prove measured timing tracks app timing.
 */
export async function installPodRoutes(page, { count, delayMs = 0 }) {
  const payload = JSON.stringify(generatePodList(count));
  await page.route('**/backend/**', async (route) => {
    const url = route.request().url();
    if (POD_LIST_RE.test(url)) {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: payload,
      });
    }
    return route.continue();
  });
}

/**
 * Intercept the single-pod GET used by the resource-detail view and fulfil it
 * with a deterministic Pod matching the requested name, so the detail/editor
 * renders without a real cluster resource.
 *
 * Register this AFTER installPodRoutes: Playwright runs route handlers in LIFO
 * order, so this one runs first and falls back to the list handler for any
 * non-single-pod URL.
 */
export async function installSinglePodRoute(page) {
  await page.route('**/backend/**', async (route) => {
    const m = route.request().url().match(SINGLE_POD_RE);
    if (m) {
      const name = decodeURIComponent(m[1]);
      const body = JSON.stringify({
        kind: 'Pod',
        apiVersion: 'v1',
        metadata: {
          name,
          namespace: 'default',
          uid: `uid-${name}`,
          creationTimestamp: '2024-01-01T00:00:00Z',
          resourceVersion: '1000',
        },
        spec: {
          nodeName: 'node-0',
          containers: [{ name: 'main', image: 'nginx:1.0' }],
        },
        status: { phase: 'Running' },
      });
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body,
      });
    }
    return route.fallback();
  });
}
