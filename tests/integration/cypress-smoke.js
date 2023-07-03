const { defineConfig } = require('cypress');

module.exports = defineConfig({
  defaultCommandTimeout: 10000,
  execTimeout: 10000,
  taskTimeout: 10000,
  pageLoadTimeout: 10000,
  requestTimeout: 10000,
  responseTimeout: 10000,
  fixturesFolder: 'fixtures',
  chromeWebSecurity: false,
  viewportWidth: 1500,
  viewportHeight: 1500,
  videoCompression: false,
  experimentalInteractiveRunEvents: true,
  numTestsKeptInMemory: 0,
  e2e: {
    testIsolation: false,
    experimentalRunAllSpecs: true,
    setupNodeEvents(on, config) {
      return require('./plugins')(on, config);
    },
    specPattern: [
      'tests/namespace/run-before.spec.js',
      'tests/namespace/create-a-deployment.spec.js',
      'tests/namespace/run-after.spec.js',
      'tests/cluster/test-cluster-overview.spec.js',
      'tests/cluster/kyma-version.spec.js',
      'tests/cluster/login-kubeconfigID.spec.js',
    ],
    supportFile: 'support/index.js',
  },
});
