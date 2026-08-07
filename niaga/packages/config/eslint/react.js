import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

import { base } from './base.js';

/** Browser-side config: adds the hooks rules and DOM globals on top of `base`. */
export const react = tseslint.config(...base, {
  files: ['**/*.{ts,tsx}'],
  languageOptions: {
    globals: { ...globals.browser },
  },
  plugins: { 'react-hooks': reactHooks },
  rules: {
    ...reactHooks.configs.recommended.rules,
  },
});

export default react;
