import { defineConfig } from 'cypress';

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
  },
});
