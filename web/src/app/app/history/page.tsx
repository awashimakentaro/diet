/**
 * web/app/app/history/page.tsx
 *
 * 【責務】
 * `/app/history` でアクセスされた場合に履歴ページへ誘導する。
 *
 * 【使用箇所】
 * - `http://localhost:3000/app/history`
 *
 * 【やらないこと】
 * - 履歴画面の描画
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/history/page.tsx へリダイレクトする。
 */

import { redirect } from 'next/navigation';

/**
 * `/app/history` から `/history` へ遷移させる。
 * 呼び出し元: Next.js `/app/history` ルート。
 * @returns 常にリダイレクトを発生させる。
 * @remarks 副作用: ルーティング遷移を発生させる。
 */
export default function AppHistoryRedirectPage(): never {
  redirect('/history');
}
