import { expect } from '@playwright/test';
import { ADDRESS, installPodRoutes, installSinglePodRoute } from './routes.js';

/** Connect the k3d cluster via the kubeconfig fixture, persisting to localStorage. */
export async function connectCluster(page) {
  await page.goto(ADDRESS);
  await page.evaluate(() => window.localStorage.clear());
  await page.goto(ADDRESS + '/clusters');
  await page.locator('ui5-button:has-text("Connect"):visible').click();
  await page
    .locator('input[id="file-upload"]')
    .setInputFiles('./fixtures/kubeconfig.yaml');
  await page.locator('ui5-button:has-text("Next Step"):visible').click();
  await page
    .locator(
      'ui5-radio-button:has-text("Local storage: Cluster data is persisted between browser reloads."):visible',
    )
    .click();
  await page.locator('ui5-button:has-text("Next Step"):visible').click();
  await page
    .locator(
      'ui5-button[accessible-name="last-step"]:has-text("Connect Cluster")',
    )
    .click();
  await expect(
    page.locator('.ui5-sn-list-li:has-text("Cluster Overview")'),
  ).toBeVisible();
}

// Re-export route installers and ADDRESS so that later scenario specs can import them from connect.js
export { installPodRoutes, installSinglePodRoute, ADDRESS };
