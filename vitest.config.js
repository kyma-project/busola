import { defineConfig, mergeConfig } from 'vitest/config';
outputs;
import viteConfig from './vite.config.mts';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['**/?(*.)+(test).[jt]s?(x)'],
      plugins: [viteTsconfigPaths()],
      globals: true, // Enable globals for Vitest
      setupFiles: ['./src/setupTests.js'],
      fileParallelism: false,
      coverage: {
        reporter: ['text'],
      },
    },
  }),
);
