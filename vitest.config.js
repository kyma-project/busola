import { defineConfig, mergeConfig } from 'vitest/config';
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
        provider: 'v8',
        reportsDirectory: 'coverage/unit',
        reporter: ['text-summary', 'lcov', 'html', 'json'],
        include: ['src/**'],
        exclude: [
          'src/**/*.cy.{ts,tsx,js,jsx}',
          'src/**/*.test.{ts,tsx,js,jsx}',
          'src/setupTests.js',
          '**/.DS_Store',
          'src/shared/components/MonacoEditorESM/hooks/*.ts',
          'src/shared/ResourceForm/fields/RichEditorDataField/RichEditorSection.tsx',
        ],
      },
    },
  }),
);
