/**
 * web/prisma.config.ts
 *
 * 【責務】
 * Web 側の Prisma CLI 実行時に datasource URL を供給する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - `prisma migrate resolve`
 * - `prisma db execute`
 * - `prisma validate`
 *
 * 【やらないこと】
 * - スキーマ定義の保持
 * - DB クエリ実装
 * - UI 実装
 *
 * 【他ファイルとの関係】
 * - schema の正本は `/Users/制作物/Diet/prisma/schema.prisma` にある。
 * - `.env` の DATABASE_URL を Prisma CLI に渡す。
 */

import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: '../prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
