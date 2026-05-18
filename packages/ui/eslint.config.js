import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Flat ESLint config (ESLint 9) for the shared UI kit. Keeps the whole
 * workspace on a single ESLint major so @typescript-eslint resolves to one
 * peer instance (a split version is what previously broke `next lint`). Mirrors
 * the intent of the legacy shared config (TS recommended + unused-var rules).
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
