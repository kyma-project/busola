import js from '@eslint/js';
import globals from 'globals';
import { globalIgnores } from 'eslint/config';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginTypeScript from '@typescript-eslint/eslint-plugin';
import parserTypeScript from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  // globalIgnores([
  //   'tests/**',
  //   '**/*.test.ts',
  //   '**/*.test.js',
  //   '**/*.test.jsx',
  //   '**/*.cy.jsx',
  //   '**/*.cy.tsx',
  //   'backend/**',
  // ]),
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: [
      'tests/**',
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.test.jsx',
      '**/*.cy.jsx',
      '**/*.cy.tsx',
      'backend/**',
    ],
    languageOptions: {
      parser: parserTypeScript,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      '@typescript-eslint': pluginTypeScript,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // TypeScript
      'no-unused-vars': ['off'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',

      // General
      'no-console': 'warn',
      'no-debugger': 'warn',
    },
  },
];
