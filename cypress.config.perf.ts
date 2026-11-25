import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    screenshotOnRunFailure: false,
    includeShadowDom: true,
    allowCypressEnv: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'tests/performance/**/*.perf.cy.{ts,tsx}',
    supportFile: 'tests/performance/support.tsx',
    retries: {
      runMode: 0,
      openMode: 0,
    },
  },

  e2e: {
    specPattern: 'nonexistent/**',
  },
});
