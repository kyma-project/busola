import {
  connectCluster,
  installPodRoutes,
  ADDRESS,
} from '../helpers/connect.js';
import { LARGE_LIST_SIZE } from '../helpers/fixtures.js';
import { measureUntil, getSampleCount } from '../helpers/measure.js';

// Readiness after load: pod rows are rendered. The predicate is pod-SPECIFIC
// (a mocked 'perf-pod-' name must be present) so it cannot be satisfied by a
// wrong page — e.g. the /clusters list, which has its own GenericList + rows.
// This also prevents stale /clusters rows from flipping it true during the warm
// navigation window before the pods page has rendered.
const LOAD_READY =
  "document.querySelectorAll('ui5-table-row').length > 0 && " +
  "document.body.innerText.includes('perf-pod-')";

// Readiness after sort: modal closed and perf-pod-0999 is the first visible row.
// Sorting descending by name makes perf-pod-0999 appear first; this confirms
// the sort actually reordered the data, not just dismissed the dialog.
const SORT_READY =
  "!document.querySelector('.sorting-modal[open]') && " +
  "document.querySelectorAll('ui5-table-row').length > 0 && " +
  "(document.querySelectorAll('ui5-table-row')[0]?.innerText || '').includes('perf-pod-0999')";

// Readiness after search: exactly one row remains and it is the pod we searched
// for. Only 1 of the 1000 generated names matches 'perf-pod-0500', so the list
// is definitively filtered once exactly one row remains.
const SEARCH_READY =
  "document.querySelectorAll('ui5-table-row').length === 1 && " +
  "document.body.innerText.includes('perf-pod-0500')";

async function measureSort(page) {
  return measureUntil(page, {
    action: async () => {
      await page
        .locator('ui5-toolbar-button[accessible-name="open-sort-modal"]')
        .click();
      // Sort descending by name so the fixture (ascending by default) is
      // genuinely reordered; SORT_READY then verifies perf-pod-0999 is first.
      await page
        .locator('ui5-radio-button[name="sortOrder"][value="DESC"]')
        .click();
      await page
        .locator('ui5-radio-button[name="sortBy"][value="name"]')
        .click();
      await page
        .locator('ui5-button[design="Emphasized"]')
        .filter({ hasText: 'OK' })
        .click();
    },
    readyScript: SORT_READY,
  });
}

async function measureSearch(page) {
  return measureUntil(page, {
    action: async () => {
      const search = page.locator('ui5-input.search-input');
      await search.click();
      await page.keyboard.type('perf-pod-0500');
    },
    readyScript: SEARCH_READY,
  });
}

export async function collectResourceList(browser) {
  const samples = getSampleCount();
  const cold = { load: [], sort: [], search: [] };
  const warm = { load: [], sort: [], search: [] };

  // Setup: run connectCluster once to get a valid storageState (localStorage with
  // cluster config). This runs in a throw-away context so each cold sample can get a
  // truly fresh context (empty HTTP cache) without re-running the connection wizard.
  const setupCtx = await browser.newContext();
  const setupPage = await setupCtx.newPage();
  await installPodRoutes(setupPage, { count: LARGE_LIST_SIZE });
  await connectCluster(setupPage);
  const m = setupPage.url().match(/\/cluster\/([^/?#]+)/);
  if (!m)
    throw new Error(
      `could not extract cluster name from URL: ${setupPage.url()}`,
    );
  const clusterName = m[1];
  const storageState = await setupCtx.storageState();
  await setupCtx.close();

  const podsUrl = `${ADDRESS}/cluster/${encodeURIComponent(clusterName)}/namespaces/default/pods`;

  for (let i = 0; i < samples; i++) {
    // Cold: fresh context = empty HTTP cache + fresh JS runtime; cluster config
    // pre-seeded via storageState so we skip the connection UI flow.
    const ctx = await browser.newContext({ storageState });
    const page = await ctx.newPage();
    await installPodRoutes(page, { count: LARGE_LIST_SIZE });

    // 1. Cold load: first ever navigation to the pods URL — HTTP cache is empty,
    //    JS runtime is fresh.
    cold.load.push(
      await measureUntil(page, {
        action: async () => page.goto(podsUrl),
        readyScript: LOAD_READY,
      }),
    );

    // 2. Cold sort and search: in-page interactions on the loaded pods list.
    cold.sort.push(await measureSort(page));
    cold.search.push(await measureSearch(page));

    // Warm: same context (HTTP cache primed), React still running on the pods
    // page. Navigate to Namespace Overview via sidebar click (in-app, not
    // measured) so the warm load is a pure React Router route change — no JS
    // context teardown, assets served from HTTP cache.
    await page
      .locator('ui5-side-navigation-item[text="Namespace Overview"]')
      .click();
    await page.waitForURL(/\/namespaces\/default\/?$/, { timeout: 15000 });

    // Expand Workloads in the sidebar if the Pods sub-item is not yet visible.
    const podsSubItem = page.locator(
      'ui5-side-navigation-sub-item[text="Pods"]',
    );
    if (!(await podsSubItem.isVisible())) {
      await page.locator('ui5-side-navigation-item[text="Workloads"]').click();
      await podsSubItem.waitFor({ state: 'visible', timeout: 5000 });
    }

    // 1. Warm load: React Router navigation from namespace overview to pods.
    warm.load.push(
      await measureUntil(page, {
        action: async () => podsSubItem.click(),
        readyScript: LOAD_READY,
      }),
    );

    // 2. Warm sort and search: same in-page interactions as cold.
    warm.sort.push(await measureSort(page));
    warm.search.push(await measureSearch(page));

    await ctx.close();
  }

  return { cold, warm };
}
