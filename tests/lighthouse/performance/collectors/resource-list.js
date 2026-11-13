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

// Readiness after sort: the sort modal has closed and pod rows are present.
const SORT_READY =
  "!document.querySelector('.sorting-modal[open]') && " +
  "document.querySelectorAll('ui5-table-row').length > 0 && " +
  "document.body.innerText.includes('perf-pod-')";

// Readiness after search: exactly one row remains and it is the pod we searched
// for. Only 1 of the 1000 generated names matches 'perf-pod-0500', so the list
// is definitively filtered once exactly one row remains.
const SEARCH_READY =
  "document.querySelectorAll('ui5-table-row').length === 1 && " +
  "document.body.innerText.includes('perf-pod-0500')";

export async function collectResourceList(page) {
  const samples = getSampleCount();
  const cold = { load: [], sort: [], search: [] };
  const warm = { load: [], sort: [], search: [] };
  await installPodRoutes(page, { count: LARGE_LIST_SIZE });

  for (let i = 0; i < samples; i++) {
    await page.context().clearCookies();
    await page.goto(ADDRESS);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await connectCluster(page);

    // Extract cluster name from the post-connect URL set by connectCluster
    // (e.g. http://localhost:8080/cluster/k3d-perfCluster). There is no trailing
    // path segment, so match up to the next /, ? or #. Throw on a miss rather
    // than falling back to a guess: a wrong cluster name redirects to /clusters
    // and we would silently measure the wrong page.
    const m = page.url().match(/\/cluster\/([^/?#]+)/);
    if (!m)
      throw new Error(`could not extract cluster name from URL: ${page.url()}`);
    const clusterName = m[1];
    const podsUrl = `${ADDRESS}/cluster/${encodeURIComponent(clusterName)}/namespaces/default/pods`;
    const clustersUrl = `${ADDRESS}/clusters`;

    const measureListInteractions = async (bucket) => {
      // 1. Load: navigate to pod list and wait for pod rows.
      bucket.load.push(
        await measureUntil(page, {
          action: async () => page.goto(podsUrl),
          readyScript: LOAD_READY,
        }),
      );

      // 2. Sort: open sort modal, select "name" column, confirm.
      //    Measured on the full LARGE_LIST_SIZE list for a meaningful signal.
      bucket.sort.push(
        await measureUntil(page, {
          action: async () => {
            await page
              .locator('ui5-toolbar-button[accessible-name="open-sort-modal"]')
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
        }),
      );

      // 3. Search: type into the search input and wait for the filtered result.
      //    Runs after sort so the full list is still visible when search starts.
      //    ui5-input is a web component (not a native input), so fill() is not
      //    allowed — click to focus then type via the keyboard.
      bucket.search.push(
        await measureUntil(page, {
          action: async () => {
            const search = page.locator('ui5-input.search-input');
            await search.click();
            await page.keyboard.type('perf-pod-0500');
          },
          readyScript: SEARCH_READY,
        }),
      );
    };

    await measureListInteractions(cold);

    // Warm: navigate away so the second load is a real navigation with a primed cache.
    await page.goto(clustersUrl);
    await measureListInteractions(warm);
  }
  return { cold, warm };
}
