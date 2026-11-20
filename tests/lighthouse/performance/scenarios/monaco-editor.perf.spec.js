import { test, expect } from '@playwright/test';
import { collectMonaco } from '../collectors/monaco-editor.js';
import { aggregateScenario } from '../helpers/aggregate.js';

test('monaco editor readiness', async ({ page }) => {
  // Allow 5 minutes: the resource-schema worker fetches the Pod OpenAPI schema
  // from the cluster on the first cold sample, which can take >60 s on k3d.
  test.setTimeout(5 * 60 * 1000);
  const { cold, warm } = await collectMonaco(page);
  const agg = aggregateScenario('monaco-editor', { cold, warm });
  expect(agg.invalid, `invalid: ${agg.invalid.join(', ')}`).toHaveLength(0);
  expect(agg.cold.ready.median).toBeGreaterThan(0);
});
