import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { chromium } from 'playwright';
import { tmpdir } from 'os';

const ADDRESS = process.env.LOCAL
  ? 'http://localhost:8080'
  : 'https://local.kyma.dev';

test('Busola Lighthouse audit', async () => {
  const context = await chromium.launchPersistentContext(tmpdir(), {
    args: ['--remote-debugging-port=9222'],
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  // clear localStorage data
  await page.goto(ADDRESS);
  await page.evaluate(() => window.localStorage.clear());

  await page.goto(ADDRESS + '/clusters');

  console.log('Running audit on /clusters...');
  await playAudit({
    page,
    port: 9222,
    thresholds: {
      accessibility: 75,
      'best-practices': 90,
    },
  });

  // fix opening "connect cluster" modal
  await page.evaluate(() => {
    return new Promise(resolve => setTimeout(resolve, 5000));
  });

  // add a cluster
  await page
    .frameLocator('iframe')
    .locator('button:has-text("Connect cluster")')
    .click();

  await page
    .frameLocator('iframe')
    .locator('input[type="file"]')
    .setInputFiles('./fixtures/kubeconfig.yaml');

  await page
    .frameLocator('iframe')
    .locator('button:has-text("Next step")')
    .click();

  await page
    .frameLocator('iframe')
    .locator(
      'text=Local storage: Cluster data is persisted between browser reloads.',
    )
    .click();

  await page
    .frameLocator('iframe')
    .locator(
      '[aria-label="Connect\\ cluster"] button:has-text("Connect cluster")',
    )
    .click();

  await expect(
    page.frameLocator('iframe').locator('text=Cluster Overview'),
  ).toBeVisible();

  console.log('Running audit on cluster details...');
  await playAudit({
    page,
    port: 9222,
    thresholds: {
      accessibility: 75,
      'best-practices': 90,
    },
  });

  await context.close();
});
