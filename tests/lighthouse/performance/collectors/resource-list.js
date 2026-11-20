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
      // Wait for the sort button to be fully enabled — UI5 Toolbar briefly marks
      // buttons as disabled while computing overflow layout after a navigation.
      await page
        .locator(
          'ui5-toolbar-button[accessible-name="open-sort-modal"]:not([disabled])',
        )
        .waitFor();
      // force: true bypasses pointer-event interception from the ToolbarChildContainer
      // wrapper that UI5 renders over button content during overflow layout.
      await page
        .locator('ui5-toolbar-button[accessible-name="open-sort-modal"]')
        .click({ force: true });
      // Sort descending by name so the fixture (ascending by default) is
      // genuinely reordered; SORT_READY then verifies perf-pod-0999 is first.
      // sortBy=name is the default selection — clicking it again after the DESC
      // radio causes a UI5 dialog re-render that makes it transiently not-visible,
      // so we skip it and rely on the default.
      await page
        .locator('ui5-radio-button[name="sortOrder"][value="DESC"]')
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
    // page. Navigate to Deployments (another Workloads sub-item) via sidebar
    // click — in-app React Router navigation, no JS context teardown.
    // Using a sibling Workloads item keeps the Workloads group expanded, so
    // the Pods sub-item remains directly clickable without any expand logic.
    await page
      .locator('ui5-side-navigation-sub-item[text="Deployments"]')
      .click();
    await page.waitForURL(/\/namespaces\/default\/deployments\/?/, {
      timeout: 15000,
    });

    // 1. Warm load: React Router navigation from Deployments to Pods.
    warm.load.push(
      await measureUntil(page, {
        action: async () =>
          page.locator('ui5-side-navigation-sub-item[text="Pods"]').click(),
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
