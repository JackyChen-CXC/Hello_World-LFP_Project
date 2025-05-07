// eslint.config.js
const { defineConfig } = require('eslint-define-config');
// const react = require('eslint-plugin-react');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = defineConfig({
  languageOptions: {
    globals: {
      node: 'readonly',
      browser: 'readonly',
    },
    parser: typescriptParser,
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
  },
  plugins: {
    // react,
    '@typescript-eslint': typescriptEslint,
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    semi: ['error', 'always'],
    quotes: ['error', 'double'],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
});