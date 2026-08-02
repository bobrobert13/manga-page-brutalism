// ESLint v9 flat config
// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astroPlugin from 'eslint-plugin-astro';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
  // Global ignores
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.astro/**',
      '.agents/**',
      'public/**',
      'docs/**',
      '**/*.min.*',
      'eslint.config.js',
      '**/*.vue',
    ],
  },

  // Base JS recommended
  js.configs.recommended,

  // TypeScript recommended
  ...tseslint.configs.recommended,

  // JS / TS files
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },
  },

  // Astro files (use eslint-plugin-astro flat helper)
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.astro'],
    rules: {
      'astro/no-set-html-directive': 'off',
    },
  },

  // .vue SFCs are intentionally skipped here — install eslint-plugin-vue
  // when the Vue islands grow past filtering. Today, astro check + a
  // dedicated Vue tooling covers them adequately.

  // Disables formatting/linting rules Prettier handles
  prettierConfig,
];
