import { defineConfig } from 'cypress';
import codeCoverage from '@cypress/code-coverage/task';

export default defineConfig({
  component: {
    screenshotOnRunFailure: false,
    includeShadowDom: true,
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.jsx',
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      codeCoverage(on, config);
      return config;
    },
  },
});
