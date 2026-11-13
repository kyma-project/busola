// @ts-check
import { devices } from '@playwright/test';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: './performance',
  testMatch: ['**/*.perf.spec.js', 'helpers.spec.js'],
  timeout: 180 * 1000,
  expect: { timeout: 20 * 1000 },
  retries: 0,
  workers: 1, // serialized: parallel workers skew timing measurements
  reporter: 'list',
  use: {
    actionTimeout: 0,
    trace: 'off', // tracing perturbs timings; use playwright.trace.config.js instead
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
};

export default config;
