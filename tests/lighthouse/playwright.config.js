// @ts-check
import { devices } from '@playwright/test';

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: './.',
  // Exclude Lighthouse-performance and user-flow performance specs: they run
  // under playwright.performance.config.js in a separate non-gating CI step
  // with its own timeouts and reporters.
  testIgnore: ['**/*.perf.spec.js', 'performance/**', 'performance.spec.js'],
  timeout: 120 * 1000,
  expect: {
    timeout: 20 * 1000,
  },
  retries: 0,
  reporter: 'dot',
  use: {
    actionTimeout: 0,
    // Tracing is disabled: traces capture network headers and injected
    // localStorage, which for these specs include the cluster kubeconfig
    // (client cert/key) and bearer token. A trace.zip would carry those
    // credentials into CI artifacts where sanitization (string replace on
    // text report files) cannot reach the compressed archive.
    trace: 'off',
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
