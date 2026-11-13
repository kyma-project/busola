import { test, expect } from '@playwright/test';
import { collectClusterOverview } from '../collectors/cluster-overview.js';
import { collectResourceList } from '../collectors/resource-list.js';
import { collectMonaco } from '../collectors/monaco-editor.js';
import { aggregateScenario } from '../helpers/aggregate.js';
import { buildReport, writeReport } from '../helpers/report.js';
import { getMeta } from '../helpers/meta.js';

// Orchestrator: run all three journeys, aggregate, and write the combined
// report (performance.json + summary.md). Each scenario's own *.perf.spec.js
// also runs standalone for focused validation; this spec produces the artifact.
test('collect all scenarios and write report', async ({ page }) => {
  // Runs three full scenarios (each connects + samples), so allow ample time.
  test.setTimeout(10 * 60 * 1000);

  const scenarios = [];
  for (const [name, fn] of [
    ['cluster-overview', collectClusterOverview],
    ['resource-list', collectResourceList],
    ['monaco-editor', collectMonaco],
  ]) {
    const { cold, warm } = await fn(page);
    const agg = aggregateScenario(name, { cold, warm });
    expect(
      agg.invalid,
      `${name} invalid: ${agg.invalid.join(', ')}`,
    ).toHaveLength(0);
    scenarios.push(agg);
  }

  const browserVersion = `chromium-${page.context().browser().version()}`;
  const report = buildReport({ scenarios, meta: getMeta(browserVersion) });
  const { jsonPath, mdPath } = writeReport(report, 'test-results/performance');
  console.log(`Wrote ${jsonPath} and ${mdPath}`);
});
