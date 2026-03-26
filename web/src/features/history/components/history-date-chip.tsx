'use client';

/**
 * web/src/features/history/components/history-date-chip.tsx
 *
 * 【責務】
 * History 画面上部の日付チップと日付選択 UI を描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - history-screen.tsx から呼ばれる。
 * - 親から渡された日付文字列を表示し、日付変更イベントを親へ返す。
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
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, type JSX } from 'react';

type HistoryDateChipProps = {
  selectedDateValue: string;
  selectedDateLabel: string;
  onSelectDate: (value: string) => void;
  onShiftDate: (days: number) => void;
  onSelectToday: () => void;
};

export function HistoryDateChip({
  selectedDateValue,
  selectedDateLabel,
  onSelectDate,
  onShiftDate,
  onSelectToday,
}: HistoryDateChipProps): JSX.Element {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleOpenPicker(): void {
    if (inputRef.current === null) {
      return;
    }

    const input = inputRef.current as HTMLInputElement & {
      showPicker?: () => void;
    };

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.click();
  }

  return (
    <section className="history-screen__date-selector">
      <div className="history-screen__date-chip">
        <button
          aria-label="カレンダーを開く"
          className="history-screen__date-icon-button"
          onClick={handleOpenPicker}
          type="button"
        >
          <CalendarDays className="history-screen__date-icon" size={18} strokeWidth={2.1} />
        </button>
        <strong>{selectedDateLabel}</strong>
      </div>

      <div className="history-screen__date-actions">
        <button
          aria-label="前日を表示"
          className="history-screen__date-action"
          onClick={() => onShiftDate(-1)}
          type="button"
        >
          <ChevronLeft size={16} strokeWidth={2.3} />
        </button>

        <button
          className="history-screen__date-action history-screen__date-action--today"
          onClick={onSelectToday}
          type="button"
        >
          今日
        </button>

        <button
          aria-label="翌日を表示"
          className="history-screen__date-action"
          onClick={() => onShiftDate(1)}
          type="button"
        >
          <ChevronRight size={16} strokeWidth={2.3} />
        </button>

      </div>

      <input
        aria-label="履歴の日付を選択"
        className="history-screen__date-input"
        onChange={(event) => onSelectDate(event.target.value)}
        ref={inputRef}
        type="date"
        value={selectedDateValue}
      />
    </section>
  );
}
