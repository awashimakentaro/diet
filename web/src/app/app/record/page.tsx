/**
 * web/app/app/record/page.tsx
 *
 * 【責務】
 * `/app/record` でアクセスされた場合に記録ページへ誘導する。
 *
 * 【使用箇所】
 * - `http://localhost:3000/app/record`
 *
 * 【やらないこと】
 * - 記録画面の描画
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/record/page.tsx へリダイレクトする。
 */

import { redirect } from 'next/navigation';

/**
 * `/app/record` から `/record` へ遷移させる。
 * 呼び出し元: Next.js `/app/record` ルート。
 * @returns 常にリダイレクトを発生させる。
 * @remarks 副作用: ルーティング遷移を発生させる。
 */
export default function AppRecordRedirectPage(): never {
  redirect('/record');
}
