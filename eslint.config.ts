import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reaachooks from 'eslint-plugin-react-hooks';

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // @ts-expect-error https://github.com/jsx-eslint/eslint-plugin-react/issues/3956
  react.configs.flat.recommended,
  reaachooks.configs.flat.recommended,
  [
    {
      files: ['**/*.{js,jsx,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      ignores: ['tests/**'],
      languageOptions: {
        globals: globals.browser,
      },
      rules: {
        // React
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': 'warn',
        'react-hooks/rules-of-hooks': 'warn',
        // TypeScript
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
        // Misc
        'no-unused-vars': 'warn',
        'no-undef': 'warn',
      },
    },
  ],
);
