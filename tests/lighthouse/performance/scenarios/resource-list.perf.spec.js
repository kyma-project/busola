import { test, expect } from '@playwright/test';
import { collectResourceList } from '../collectors/resource-list.js';
import { aggregateScenario } from '../helpers/aggregate.js';

test('resource list load/search/sort', async ({ page }) => {
  const { cold, warm } = await collectResourceList(page);
  const agg = aggregateScenario('resource-list', { cold, warm });
  expect(agg.invalid, `invalid: ${agg.invalid.join(', ')}`).toHaveLength(0);
  for (const m of ['load', 'sort', 'search']) {
    expect(agg.cold[m].median, `cold.${m}`).toBeGreaterThan(0);
  }
});
