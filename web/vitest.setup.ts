/**
 * web/vitest.setup.ts
 *
 * 【責務】
 * Web 版テスト実行前の共通初期化を行う。
 *
 * 【使用箇所】
 * - web/vitest.config.ts の setupFiles
 *
 * 【やらないこと】
 * - 個別テストケースの定義
 * - 本番コードの実装
 *
 * 【他ファイルとの関係】
 * - Testing Library の matcher を全テストで利用可能にする。
 */

import '@testing-library/jest-dom/vitest';
