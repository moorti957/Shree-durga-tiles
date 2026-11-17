const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['legacy_flutter/**', 'design/**', 'assets/**', 'node_modules/**', '.expo/**'],
  },
]);
