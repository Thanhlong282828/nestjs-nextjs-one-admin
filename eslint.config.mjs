import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextVitals from 'eslint-config-next/core-web-vitals';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceFiles = ['apps/admin/**/*.{ts,tsx}', 'apps/api/src/**/*.ts', 'packages/*/src/**/*.ts'];
const frontendFiles = ['apps/admin/**/*.{ts,tsx}'];
const nodeFiles = ['apps/api/{scripts,test}/**/*.mjs', 'packages/*/test/**/*.mjs', 'scripts/**/*.mjs'];
const root = path.dirname(fileURLToPath(import.meta.url));

export default [
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/generated/**', '**/next-env.d.ts'] },
  { ...js.configs.recommended, files: sourceFiles },
  { ...js.configs.recommended, files: nodeFiles, languageOptions: { globals: globals.node } },
  ...tseslint.configs.recommended.map(config => ({ ...config, files: sourceFiles })),
  ...nextVitals.map(config => ({ ...config, files: frontendFiles })),
  { files: ['apps/admin/**/*.{ts,tsx}'], settings: { next: { rootDir: path.join(root, 'apps/admin') } } },
  { files: sourceFiles, rules: { 'no-undef': 'off', '@typescript-eslint/no-explicit-any': 'error' } },
];
