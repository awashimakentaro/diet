/**
 * web/app/page.tsx
 *
 * 【責務】
 * Web 版トップページでログイン / サインアップ画面を表示する。
 *
 * 【使用箇所】
 * - `/` ルートで表示される。
 *
 * 【やらないこと】
 * - `/app/*` の認証ガード
 * - セッション永続化
 * - 食事データ取得
 *
 * 【他ファイルとの関係】
 * - web/src/components/web-auth-screen.tsx を描画して認証導線を提供する。
 */

import type { JSX } from 'react';

import { WebAuthScreen } from '@/components/web-auth-screen';

type HomePageProps = {
  searchParams?: Promise<{
    redirect?: string;
  }>;
};

/**
 * `/` に認証画面を表示する。
 * 呼び出し元: Next.js `/` ルート。
 * @returns 認証画面 JSX
 * @remarks 副作用は存在しない。
 */
export default async function HomePage({
  searchParams,
}: HomePageProps): Promise<JSX.Element> {
  const resolvedSearchParams = (await searchParams) ?? {};

  return <WebAuthScreen redirectPathCandidate={resolvedSearchParams.redirect ?? null} />;
}
