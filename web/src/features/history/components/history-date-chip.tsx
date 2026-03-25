'use client';

/**
 * web/src/features/history/components/history-date-chip.tsx
 *
 * 【責務】
 * History 画面上部の日付チップを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - history-screen.tsx から呼ばれる。
 * - 親から渡された日付文字列を表示する。
 *
 * 【やらないこと】
 * - 日付計算
 * - 履歴一覧描画
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - use-history-screen.ts の選択日表示に依存する。
 */

import { CalendarDays } from 'lucide-react';
import type { JSX } from 'react';

type HistoryDateChipProps = {
  selectedDateLabel: string;
};

export function HistoryDateChip({
  selectedDateLabel,
}: HistoryDateChipProps): JSX.Element {
  return (
    <div className="history-screen__date-chip">
      <CalendarDays className="history-screen__date-icon" size={18} strokeWidth={2.1} />
      <strong>{selectedDateLabel}</strong>
    </div>
  );
}
