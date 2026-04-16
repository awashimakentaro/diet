/**
 * web/next.config.ts
 *
 * 【責務】
 * Web 版 Next.js アプリのビルド設定を定義する。
 *
 * 【使用箇所】
 * - `next dev` / `next build` / `next start` 実行時に読み込まれる。
 *
 * 【やらないこと】
 * - 画面 UI の定義
 * - ドメインロジックの実装
 *
 * 【他ファイルとの関係】
 * - web/package.json の各スクリプトから利用される。
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: currentDirectory,
  reactStrictMode: true,
};

export default withSentryConfig(nextConfig, {
  org: 'awashima',
  project: 'diet',
  silent: true,
});
