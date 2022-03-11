import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { chromium } from 'playwright';
import { tmpdir } from 'os';

const ADDRESS = 'https://local.kyma.dev';

test('Busola Lighthouse audit', async () => {
  const context = await chromium.launchPersistentContext(tmpdir(), {
    args: ['--remote-debugging-port=9222'],
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  await page.goto(ADDRESS);

  await page.evaluate(() => window.localaStorage.clear());

  await page.goto(ADDRESS + '/clusters');

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

  await playAudit({
    page,
    port: 9222,
    thresholds: {
      performance: 73,
      accessibility: 77,
      'best-practices': 100,
      seo: 0, // ignored
      pwa: 0, // ignored
    },
  });

  await context.close();
});
