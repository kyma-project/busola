const { defineConfig } = require('cypress');

module.exports = defineConfig({
  includeShadowDom: true,
  defaultCommandTimeout: 10000,
  execTimeout: 10000,
  taskTimeout: 10000,
  pageLoadTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  fixturesFolder: 'fixtures',
  chromeWebSecurity: false,
  viewportWidth: 1500,
  video: true,
  viewportHeight: 1500,
  videoCompression: false,
  scrollBehavior: false,
  screenshotsFolder: process?.env?.ARTIFACTS
    ? `${process.env?.ARTIFACTS}/screenshots`
    : 'cypress/screenshots',
  videosFolder: process?.env?.ARTIFACTS
    ? `${process.env?.ARTIFACTS}/videos`
    : 'cypress/videos',
  experimentalInteractiveRunEvents: true,
  numTestsKeptInMemory: 0,
  e2e: {
    testIsolation: false,
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      return require('./plugins')(on, config);
    },
    specPattern: [
      'tests/cluster/test-check-extensions.spec.js',
      'tests/namespace/a-run-before.spec.js',
      'tests/namespace/test-smoke-service-management.spec.js',
      'tests/namespace/test-check-extensions.spec.js',
      'tests/namespace/z-run-after.spec.js',
    ],
    supportFile: 'support/index.js',
  },
});
