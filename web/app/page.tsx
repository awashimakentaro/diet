/**
 * web/app/page.tsx
 *
 * 【責務】
 * Web 版トップページから記録タブへ誘導する。
 *
 * 【使用箇所】
 * - `/` ルートで表示される。
 *
 * 【やらないこと】
 * - 記録画面の描画
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/record/page.tsx の記録ページへリダイレクトする。
 */

import { redirect } from 'next/navigation';

/**
 * `/` から `/record` へ遷移させる。
 * 呼び出し元: Next.js `/` ルート。
 * @returns 常にリダイレクトを発生させる。
 * @remarks 副作用: ルーティング遷移を発生させる。
 */
export default function HomePage(): never {
  redirect('/record');
}
