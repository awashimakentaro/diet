/**
 * web/.storybook/preview.ts
 *
 * 【責務】
 * Storybook 共通プレビュー設定とグローバル CSS 読み込みを行う。
 *
 * 【使用箇所】
 * - Storybook 起動時に自動読込される。
 *
 * 【やらないこと】
 * - 個別 story の定義
 * - 本番 UI ロジックの実装
 *
 * 【他ファイルとの関係】
 * - web/src/styles/globals.css の見た目を Storybook に反映する。
 */

import type { Preview } from '@storybook/react';

import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
