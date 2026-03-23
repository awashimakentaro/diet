/**
 * web/.storybook/main.ts
 *
 * 【責務】
 * Storybook の stories 探索先と addon 構成を定義する。
 *
 * 【使用箇所】
 * - `npm run storybook`
 * - `npm run build-storybook`
 *
 * 【やらないこと】
 * - コンポーネント実装
 * - 本番アプリのビルド設定代替
 *
 * 【他ファイルとの関係】
 * - web/.storybook/preview.ts と組み合わせて Storybook 環境を構成する。
 */

import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx|mdx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
};

export default config;
