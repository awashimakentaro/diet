/**
 * web/src/store/use-web-shell-store.ts
 *
 * 【責務】
 * Web 版の UI シェルに関する軽量状態を zustand で管理する。
 *
 * 【使用箇所】
 * - 今後の Web ナビゲーションやモーダル状態管理
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - コンポーネント描画
 *
 * 【他ファイルとの関係】
 * - zustand を採用する入口として扱う。
 */

import { create } from 'zustand';

type WebShellState = {
  isNavigationCompact: boolean;
  setNavigationCompact: (nextValue: boolean) => void;
};

/**
 * Web シェル用の zustand ストアを提供する。
 * 呼び出し元: 今後の Web UI コンポーネント。
 * @returns zustand ストア
 * @remarks 副作用は存在しない。
 */
export const useWebShellStore = create<WebShellState>((set) => ({
  isNavigationCompact: false,
  setNavigationCompact(nextValue) {
    set({ isNavigationCompact: nextValue });
  },
}));
