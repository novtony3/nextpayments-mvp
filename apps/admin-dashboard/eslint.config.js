import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Flat ESLint config (ESLint 9). Admin is the only ESLint-CLI consumer in the
 * workspace; the shared `@nextpayments/eslint-config` is legacy eslintrc-format
 * and can't be flat-extended, so this mirrors its intent (TS recommended +
 * unused-var / console rules) while keeping the whole repo on a single ESLint
 * major (avoids @typescript-eslint peer-instance conflicts with next lint).
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
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
