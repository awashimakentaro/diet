/**
 * web/vitest.config.ts
 *
 * 【責務】
 * Web 版の Vitest 実行設定を定義する。
 *
 * 【使用箇所】
 * - `npm run test`
 *
 * 【やらないこと】
 * - 本番ビルド設定の管理
 * - アプリ固有ロジックの実装
 *
 * 【他ファイルとの関係】
 * - web/vitest.setup.ts と連携し、テスト環境を初期化する。
 */

import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

/**
 * Vitest の設定を返す。
 * 呼び出し元: Vitest CLI。
 * @returns Vitest 設定オブジェクト
 * @remarks 副作用は存在しない。
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.join(currentDirectory, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
