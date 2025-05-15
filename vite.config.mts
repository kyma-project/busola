/// <reference types="vitest/config" />
import { defineConfig, transformWithEsbuild } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import eslint from 'vite-plugin-eslint';
import fs from 'fs';
import glob from 'glob';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  server: {
    port: 8080,
    warmup: {
      clientFiles: [
        'cypress/support/component.jsx',
        'src/**/*.cy.{js,jsx,ts,tsx}',
      ]
    },
    proxy: {
      // with options
      '^/backend/.*': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/proxy': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
    },
  },
  plugins: [
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return null;

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
    react(),
    viteTsconfigPaths(),
    svgr({
      include: '**/*.svg?react',
    }),
    viteStaticCopy({
      targets: [
        {
          src: 'resource-validation/rule-sets/**/*.yaml',
          dest: 'resource-validation',
          rename: 'rule-set.yaml',
          transform() {
            return mergeYamlFiles('resource-validation/rule-sets/**/*.yaml');
          },
        },
      ],
    }),
    eslint()
  ],
  worker: {
    plugins: () => [viteTsconfigPaths()],
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
    include: [
      '@openapi-contrib/openapi-schema-to-json-schema',
      '@stoplight/json-ref-resolver',
      'monaco-yaml/yaml.worker.js'
    ],
    entries: [
      'cypress/support/component.jsx',
      'src/**/*.cy.{js,jsx,ts,tsx}'
    ]
  },
  define: {
    'process.env.IS_DOCKER': JSON.stringify(process.env.IS_DOCKER || false),
  },
});

function mergeYamlFiles (filesPath) {
  let mergedYamlContent = '';

  const files = glob.sync(filesPath);

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    mergedYamlContent += `---\n${content}\n`;
  });

  return mergedYamlContent;
}
