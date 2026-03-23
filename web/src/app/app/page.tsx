/**
 * web/app/app/page.tsx
 *
 * 【責務】
 * `/app` でアクセスされた場合に記録ページへ誘導する。
 *
 * 【使用箇所】
 * - `http://localhost:3000/app`
 *
 * 【やらないこと】
 * - 画面描画
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/record/page.tsx の記録ページへリダイレクトする。
 */

import { redirect } from 'next/navigation';

/**
 * `/app` から `/record` へ遷移させる。
 * 呼び出し元: Next.js `/app` ルート。
 * @returns 常にリダイレクトを発生させる。
 * @remarks 副作用: ルーティング遷移を発生させる。
 */
export default function AppIndexRedirectPage(): never {
  redirect('/record');
}
