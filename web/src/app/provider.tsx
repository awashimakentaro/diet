'use client';

/**
 * web/src/app/provider.tsx
 *
 * 【責務】
 * App Router 配下へ Web 版の共通 Provider 群を適用する。
 *
 * 【使用箇所】
 * - web/src/app/layout.tsx から全画面を包む。
 *
 * 【やらないこと】
 * - 画面 UI の描画
 * - ルーティング制御
 * - 個別機能のデータ取得
 *
 * 【他ファイルとの関係】
 * - web/src/providers/web-auth-provider.tsx を最上位 Provider として利用する。
 */

import type { JSX, ReactNode } from 'react';

import { WebAuthProvider } from '@/providers/web-auth-provider';

type AppProviderProps = {
  children: ReactNode;
};

/**
 * Web 版で必要な Provider をまとめて適用する。
 * 呼び出し元: RootLayout。
 * @param props.children レイアウト配下の描画内容
 * @returns Provider 適用後の JSX
 * @remarks 副作用は存在しない。
 */
export function AppProvider({ children }: AppProviderProps): JSX.Element {
  return <WebAuthProvider>{children}</WebAuthProvider>;
}
