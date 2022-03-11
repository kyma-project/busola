import { test, expect } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { chromium } from 'playwright';
import { tmpdir } from 'os';

test('Busola Lighthouse audit', async () => {
  const context = await chromium.launchPersistentContext(tmpdir(), {
    args: ['--remote-debugging-port=9222'],
  });
  const page = await context.newPage();

  await page.goto('http://localhost:8080');

  await page.evaluate(() => window.localStorage.clear());

  await page.goto('http://localhost:8080/clusters');

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
      performance: 3,
      accessibility: 3,
      'best-practices': 3,
      seo: 3,
      pwa: 3,
    },
  });

  await context.close();
});
