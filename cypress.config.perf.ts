import { defineConfig } from 'cypress';

export default defineConfig({
  component: {
    screenshotOnRunFailure: false,
    includeShadowDom: true,
    allowCypressEnv: false,
    devServer: {
      framework: 'react',
      bundler: 'vite',
      // Use the profiling build of react-dom so React.Profiler reports
      // actualDuration and baseDuration even in production-like builds.
      viteConfig: {
        resolve: {
          alias: { 'react-dom': 'react-dom/profiling' },
        },
      },
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
