/**
 * web/app/app/settings/page.tsx
 *
 * 【責務】
 * `/app/settings` でアクセスされた場合に設定ページへ誘導する。
 *
 * 【使用箇所】
 * - `http://localhost:3000/app/settings`
 *
 * 【やらないこと】
 * - 設定画面の描画
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/settings/page.tsx へリダイレクトする。
 */

import { redirect } from 'next/navigation';

/**
 * `/app/settings` から `/settings` へ遷移させる。
 * 呼び出し元: Next.js `/app/settings` ルート。
 * @returns 常にリダイレクトを発生させる。
 * @remarks 副作用: ルーティング遷移を発生させる。
 */
export default function AppSettingsRedirectPage(): never {
  redirect('/settings');
}
