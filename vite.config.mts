/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import eslint from '@nabla/vite-plugin-eslint';
import istanbul from 'vite-plugin-istanbul';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const FONTS_DEST = 'fonts/72';
const FONT_CDN_RE =
  /https:\/\/cdn\.jsdelivr\.net\/npm\/@sap-theming\/theming-base-content@[^/]+\/content\/Base\/baseLib\/baseTheme\/fonts\//g;

// Rewrites CDN font URLs in UI5's generated FontFace.css.js to local paths,
// and serves the font files from node_modules during dev.
function sapui5LocalFonts() {
  const fontsDir = path.resolve(
    'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts',
  );
  return {
    name: 'sapui5-local-fonts',
    transform(code: string, id: string) {
      if (!id.includes('FontFace.css.js')) return;
      return code.replace(FONT_CDN_RE, `/${FONTS_DEST}/`);
    },
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use(`/${FONTS_DEST}`, (req, res, next) => {
        const file = path.join(fontsDir, req.url ?? '');
        if (fs.existsSync(file)) {
          res.setHeader('Content-Type', 'font/woff2');
          fs.createReadStream(file).pipe(res);
        } else {
          next();
        }
      });
    },
  };
}

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
      ],
    },
    proxy: {
      // with options
      '^/backend/.*': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      '/proxy': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr({
      include: '**/*.svg?react',
    }),
    sapui5LocalFonts(),
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
        {
          src: 'node_modules/@sap-theming/theming-base-content/content/Base/baseLib/baseTheme/fonts/*.woff2',
          dest: FONTS_DEST,
        },
      ],
    }),
    eslint(),
    process.env.CYPRESS_COVERAGE === 'true' &&
      istanbul({
        include: 'src/**',
        exclude: ['**/*.cy.{ts,tsx}', 'src/setupTests.js'],
        extension: ['.ts', '.tsx', '.js', '.jsx'],
        requireEnv: false,
      }),
  ],
  worker: {
    plugins: () => [viteTsconfigPaths()],
  },
  optimizeDeps: {
    force: true,
    exclude: ['@ui5/webcomponents-base'],
    include: [
      '@openapi-contrib/openapi-schema-to-json-schema',
      '@stoplight/json-ref-resolver',
      'monaco-yaml/yaml.worker.js',
    ],
  },
  define: {
    'process.env.IS_DOCKER': JSON.stringify(process.env.IS_DOCKER || false),
  },
});

function mergeYamlFiles(filesPath: string) {
  let mergedYamlContent = '';

  const files = glob.sync(filesPath);

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf-8');
    mergedYamlContent += `---\n${content}\n`;
  });

  return mergedYamlContent;
}
