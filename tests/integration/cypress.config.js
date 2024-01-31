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
  viewportHeight: 1500,
  scrollBehavior: false,
  video: true,
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
      'tests/cluster/test-download-a-kubeconfig.spec.js',
      'tests/cluster/test-cluster-overview.spec.js',
      'tests/cluster/test-cluster-role-bindings.spec.js',
      'tests/cluster/test-cluster-validation.spec.js',
      'tests/cluster/test-storage-classes.spec.js',
      'tests/cluster/test-persistent-volumes.spec.js',
      'tests/cluster/test-dashboard-version.spec.js',
      'tests/cluster/test-invalid-kubeconfig.spec.js',
      'tests/cluster/test-login-kubeconfigID.spec.js',
      'tests/cluster/test-multiple-context-kubeconfig.spec.js',
      'tests/cluster/test-other-login-options.spec.js',
      'tests/cluster/test-cluster-configuration.spec.js',
      'tests/cluster/test-command-palette.spec.js',
      'tests/cluster/test-custom-resources.spec.js',
      'tests/cluster/test-navigation-features.spec.js',
      'tests/extensibility/ext-test-pizzas.spec.js',
      'tests/extensibility/ext-test-services.spec.js',
      'tests/extensibility/ext-test-variables.spec.js',
      'tests/namespace/a-run-before.spec.js',
      'tests/namespace/test-namespace-overview.spec.js',
      'tests/namespace/test-navigation.spec.js',
      'tests/namespace/test-deployments.spec.js',
      'tests/namespace/test-services.spec.js',
      'tests/namespace/test-events.spec.js',
      'tests/namespace/test-roles.spec.js',
      'tests/namespace/test-resource-upload.spec.js',
      'tests/namespace/test-resource-validation.spec.js',
      'tests/namespace/test-protected-resources.spec.js',
      'tests/namespace/test-jobs.spec.js',
      'tests/namespace/test-replica-sets.spec.js',
      'tests/namespace/test-cron-jobs.spec.js',
      'tests/namespace/test-stateful-sets.spec.js',
      'tests/namespace/test-config-maps.spec.js',
      'tests/namespace/test-settings.spec.js',
      'tests/namespace/test-secrets.spec.js',
      'tests/namespace/test-service-accounts.spec.js',
      'tests/namespace/test-daemon-sets.spec.js',
      'tests/namespace/test-reduced-permissions.spec.js',
      'tests/namespace/test-reduced-permissions--configuration.spec.js',
      'tests/namespace/test-ingresses.spec.js',
      'tests/namespace/test-network-policies.spec.js',
      'tests/namespace/test-persistent-volume-claims.spec.js',
      'tests/namespace/test-custom-resources.spec.js',
      'tests/namespace/z-run-after.spec.js',
    ],
    supportFile: 'support/index.js',
  },
});
