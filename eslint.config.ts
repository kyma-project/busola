import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-plugin-react';
import reaachooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // @ts-expect-error https://github.com/jsx-eslint/eslint-plugin-react/issues/3956
  react.configs.flat.recommended,
  reaachooks.configs.flat.recommended,
  [
    globalIgnores([
      'tests/**',
      '**/*.test.js*',
      '**/__mocks__/**',
      '**/build/**',
    ]),

    {
      files: ['**/*.{js,jsx,mjs,cjs,ts,mts,cts,tsx}'],
      languageOptions: {
        globals: globals.browser,
      },
      rules: {
        // React
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',

        // TypeScript
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-unsafe-function-type': 'warn',
        '@typescript-eslint/no-unused-expressions': [
          'error',
          {
            allowTernary: true,
            allowShortCircuit: true,
          },
        ],
        '@typescript-eslint/ban-ts-comment': 'error',
        '@typescript-eslint/no-require-imports': [
          'error',
          {
            allow: [
              'babel',
              'compression',
              'config.js',
              'cors',
              'express',
              'fs',
              'http',
              'https',
              'js-yaml',
              'lodash',
              'path',
              'webpack',
            ],
          },
        ],
        // Misc
        'no-unused-vars': 'off',
        'prefer-const': 'error',
      },
    },
  ],
);
