import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.js'],
    // Don't use the root setupFiles (which loads React/Cypress stuff)
    setupFiles: [],
  },
});
