/**
 * web/prisma.config.ts
 *
 * 【責務】
 * Prisma 7 向けのデータソース URL とスキーマ位置を定義する。
 *
 * 【使用箇所】
 * - `npm run prisma:generate`
 * - 今後の Prisma CLI コマンド
 *
 * 【やらないこと】
 * - DB クエリ実装
 * - Next.js 画面実装
 *
 * 【他ファイルとの関係】
 * - web/prisma/schema.prisma の datasource 設定を補完する。
 */

import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

const config = defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),
  },
});

export default config;
