import { test, expect } from '@playwright/test';
import { collectClusterOverview } from '../collectors/cluster-overview.js';
import { aggregateScenario } from '../helpers/aggregate.js';

test('cluster overview readiness', async ({ browser }) => {
  const { cold, warm } = await collectClusterOverview(browser);
  const agg = aggregateScenario('cluster-overview', { cold, warm });
  expect(
    agg.invalid,
    `invalid measurements: ${agg.invalid.join(', ')}`,
  ).toHaveLength(0);
  expect(agg.cold.ready.median).toBeGreaterThan(0);
});
