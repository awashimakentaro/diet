/**
 * hooks/use-diet-state.ts
 *
 * 【責務】
 * DietState を React コンポーネントから購読できるユーティリティフックを提供する。
 *
 * 【使用箇所】
 * - 各スクリーンおよび UI コンポーネント
 *
 * 【やらないこと】
 * - 状態の更新ロジック
 * - エージェント責務の肩代わり
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts の subscribe/get を利用する。
 */

import { useSyncExternalStore } from 'react';

import { DietState, getDietState, subscribeDietState } from '@/lib/diet-store';

/**
 * DietState の特定の切り出しを購読し、変更時に再レンダリングする。
 * 呼び出し元: RecordScreen, HistoryScreen など。
 * @param selector State から必要な値を取り出す関数
 * @returns selector が返したスライス
 * @remarks 副作用は React の再レンダリングのみ。
 */
export function useDietState<T>(selector: (state: DietState) => T): T {
  return useSyncExternalStore(subscribeDietState, () => selector(getDietState()));
}
