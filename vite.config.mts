import { defineConfig, transformWithEsbuild } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
  },
  server: {
    port: 8080,
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
          src: 'resources/base/resource-validation/rule-sets/**/*.yaml',
          dest: 'resource-validation',
          rename: 'rule-set.yaml',
          transform(content) {
            return `---\n${content.toString()}\n`;
          },
        },
      ],
    }),
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
    ]
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, 'src/shared'),
    },
  },
  define: {
    'process.env.IS_DOCKER': JSON.stringify(process.env.IS_DOCKER),
  },
});
