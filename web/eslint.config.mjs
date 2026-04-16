/* 【責務】
 * web の ESLint 9 向け設定を定義する。
 */

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { FlatCompat } from '@eslint/eslintrc';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: currentDirectory,
});

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'storybook-static/**',
      'test-results/**',
      'coverage/**',
      'public/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
  ),
];

export default config;
