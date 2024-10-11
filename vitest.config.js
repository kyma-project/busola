import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.mts';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      plugins: [viteTsconfigPaths()],
      globals: true, // Enable globals for Vitest
      setupFiles: ['./src/setupTests.js'],
    },
  }),
);
