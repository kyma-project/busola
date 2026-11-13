import {
  connectCluster,
  installPodRoutes,
  installSinglePodRoute,
  ADDRESS,
} from '../helpers/connect.js';
import { measureUntil, getSampleCount } from '../helpers/measure.js';

// Readiness: the Monaco model is mounted and ready for input, not merely the
// container div. We require the rendered text layer (.view-lines) AND the input
// textarea Monaco creates once the editor is interactive — "editor visible" is
// not the same as "ready for input".
const EDITOR_READY =
  "!!document.querySelector('.monaco-editor .view-lines') && " +
  "!!document.querySelector('.monaco-editor textarea')";

// The editor is unmounted when the View tab is active (used to reset between
// cold and warm so the warm measurement starts from a no-editor state).
const editorGone = () => !document.querySelector('.monaco-editor');

export async function collectMonaco(page) {
  const samples = getSampleCount();
  const cold = { ready: [] };
  const warm = { ready: [] };
  await installPodRoutes(page, { count: 3 });
  // Register the single-pod handler AFTER the list handler so it runs first
  // (Playwright LIFO) and serves the detail-view resource fetch.
  await installSinglePodRoute(page);

  const openDetail = async () => {
    await page.goto(ADDRESS);
    await page.evaluate(() => {
      localStorage.clear();
    });
    await connectCluster(page);
    const m = page.url().match(/\/cluster\/([^/?#]+)/);
    if (!m)
      throw new Error(`could not extract cluster name from URL: ${page.url()}`);
    await page.goto(`${ADDRESS}/cluster/${m[1]}/namespaces/default/pods`);
    await page.waitForSelector('ui5-table-row');
    await page.locator('ui5-table-row').first().click();
    // Wait for the detail's View/Edit tabs to render before measuring.
    // exact:true so "Edit" cannot match a future "Edit YAML"/"Editor" tab, nor
    // the Settings dialog's "Theme" tab.
    await page.getByRole('tab', { name: 'Edit', exact: true }).waitFor();
  };

  const openEditor = async () =>
    page.getByRole('tab', { name: 'Edit', exact: true }).click();
  const closeEditor = async () =>
    page.getByRole('tab', { name: 'View', exact: true }).click();

  for (let i = 0; i < samples; i++) {
    await page.context().clearCookies();
    await openDetail();

    // Cold: first time the Monaco module + worker initialise this session.
    // Guard that the editor is absent before measuring (symmetric with warm):
    // the detail defaults to the View tab, but this makes the ~0 pre-mount state
    // explicit rather than relying on that default.
    // NOTE: page.goto() in openDetail re-evaluates the JS context (modules +
    // worker re-init — the dominant cost), so each sample's cold measure captures
    // a real re-initialisation. The HTTP cache does persist across samples within
    // the context, so chunk *downloads* are skipped on samples 2+; "cold" here
    // means "first editor open after a fresh navigation", not a cold HTTP cache.
    await page.waitForFunction(editorGone);
    cold.ready.push(
      await measureUntil(page, {
        action: openEditor,
        readyScript: EDITOR_READY,
      }),
    );

    // Reset to the View tab so the editor unmounts, then re-open for the warm
    // measurement (Monaco chunks + worker are now cached).
    await closeEditor();
    await page.waitForFunction(editorGone);
    warm.ready.push(
      await measureUntil(page, {
        action: openEditor,
        readyScript: EDITOR_READY,
      }),
    );
  }
  return { cold, warm };
}
