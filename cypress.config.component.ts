import { defineConfig } from 'cypress';
import viteConfig from './vite.config.mts';

export default defineConfig({
  component: {
    screenshotOnRunFailure: false,
    includeShadowDom: true,
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        ...viteConfig,
      },
    },
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.jsx',
  },
});
