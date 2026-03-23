/**
 * web/app/app/foods/page.tsx
 *
 * 【責務】
 * `/app/foods` でアクセスされた場合に食品ライブラリページへ誘導する。
 *
 * 【使用箇所】
 * - `http://localhost:3000/app/foods`
 *
 * 【やらないこと】
 * - 食品画面の描画
 * - データ取得
 * - 状態管理
 *
 * 【他ファイルとの関係】
 * - web/app/foods/page.tsx へリダイレクトする。
 */

import { redirect } from 'next/navigation';

/**
 * `/app/foods` から `/foods` へ遷移させる。
 * 呼び出し元: Next.js `/app/foods` ルート。
 * @returns 常にリダイレクトを発生させる。
 * @remarks 副作用: ルーティング遷移を発生させる。
 */
export default function AppFoodsRedirectPage(): never {
  redirect('/foods');
}
