import { test, expect } from '@playwright/test';
import { collectMonaco } from '../collectors/monaco-editor.js';
import { aggregateScenario } from '../helpers/aggregate.js';

test('monaco editor readiness', async ({ page }) => {
  const { cold, warm } = await collectMonaco(page);
  const agg = aggregateScenario('monaco-editor', { cold, warm });
  expect(agg.invalid, `invalid: ${agg.invalid.join(', ')}`).toHaveLength(0);
  expect(agg.cold.ready.median).toBeGreaterThan(0);
});
