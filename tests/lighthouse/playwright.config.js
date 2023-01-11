// @ts-check
import { devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: './.',
  timeout: 120 * 1000,
  expect: {
    timeout: 20 * 1000,
  },
  retries: 0,
  reporter: 'dot',
  use: {
    actionTimeout: 0,
    trace: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};

export default config;
