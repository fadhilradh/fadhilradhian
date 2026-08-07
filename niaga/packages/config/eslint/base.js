import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Shared flat config for every TypeScript package in the monorepo. */
export const base = tseslint.config(
  { ignores: ['dist/**', '.turbo/**', 'node_modules/**', 'migrations/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
    },
  },
);

export default base;
