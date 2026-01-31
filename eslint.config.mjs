import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
    },
  },
];
