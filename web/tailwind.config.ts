/**
 * web/tailwind.config.ts
 *
 * 【責務】
 * Web 版で利用する Tailwind CSS の走査対象と拡張設定を定義する。
 *
 * 【使用箇所】
 * - Tailwind CSS ビルド時
 * - Storybook のスタイル解決時
 *
 * 【やらないこと】
 * - コンポーネント描画
 * - 実行時ロジック
 *
 * 【他ファイルとの関係】
 * - web/postcss.config.mjs と連携してユーティリティ CSS を生成する。
 */

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};

export default config;
