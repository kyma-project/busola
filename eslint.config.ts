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
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react/jsx-key': 'warn',
        'react/display-name': 'warn',
        'react/no-children-prop': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/rules-of-hooks': 'warn',
        'react-hooks/refs': 'warn',
        'react-hooks/set-state-in-effect': 'warn',
        'react-hooks/preserve-manual-memoization': 'warn',
        'react-hooks/immutability': 'warn',
        'react-hooks/purity': 'warn',
        'react-hooks/static-components': 'warn',
        'react-hooks/use-memo': 'warn',

        // TypeScript
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
        '@typescript-eslint/no-unsafe-function-type': 'warn',
        '@typescript-eslint/no-unused-expressions': 'warn',
        '@typescript-eslint/ban-ts-comment': 'warn',
        '@typescript-eslint/no-require-imports': 'warn',
        // Misc
        'no-unused-vars': [
          'warn',
          {
            varsIgnorePattern: '^_',
            argsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        'no-undef': 'warn',
        'no-case-declarations': 'warn',
        'no-constant-binary-expression': 'warn',
        'no-empty': 'warn',
        'no-irregular-whitespace': 'warn',
        'no-prototype-builtins': 'warn',
        'no-unsafe-optional-chaining': 'warn',
        'prefer-const': 'warn',
      },
    },
  ],
);
