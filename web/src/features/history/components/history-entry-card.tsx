/**
 * web/src/features/history/components/history-entry-card.tsx
 *
 * 【責務】
 * History 画面の1件分の履歴カードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - history-screen.tsx から呼ばれる。
 * - 履歴データとローカル操作ハンドラを受け取る。
 *
 * 【やらないこと】
 * - データ取得
 * - 日付切り替え管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web-formatters.ts の表示用関数に依存する。
 */

import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WebMeal } from '@/domain/web-diet-schema';
import { formatTimeLabel } from '@/lib/web-formatters';

type HistoryEntryCardProps = {
  meal: WebMeal;
  onDelete: (mealId: string) => void;
  onSave: (mealId: string) => void;
};

function getSourceLabel(source: WebMeal['source']): string {
  if (source === 'image') {
    return 'image';
  }

  if (source === 'manual') {
    return 'manual';
  }

  if (source === 'library') {
    return 'library';
  }

  return 'text';
}

export function HistoryEntryCard({
  meal,
  onDelete,
  onSave,
}: HistoryEntryCardProps): JSX.Element {
  const firstItem = meal.items[0];

  return (
    <article className="history-screen__card">
      <div className="history-screen__card-head">
        <div className="history-screen__meal-meta">
          <h2>{meal.menuName}</h2>
          <p>
            {formatTimeLabel(meal.recordedAt)} <span>•</span> {getSourceLabel(meal.source)}
          </p>
        </div>
        <div className="history-screen__kcal-box">
          <strong>{meal.totals.kcal}</strong>
          <span>kcal</span>
        </div>
      </div>

      <div className="history-screen__item-row">
        <span>{firstItem?.name ?? meal.menuName}</span>
        <div>
          <span>{firstItem?.amount ?? '-'}</span>
          <strong>{firstItem?.kcal ?? meal.totals.kcal} kcal</strong>
        </div>
      </div>

      <div className="history-screen__actions">
        <button className="history-screen__action" type="button">
          <Pencil size={14} strokeWidth={1.9} />
          <span>編集</span>
        </button>
        <button
          className="history-screen__action"
          onClick={() => onDelete(meal.id)}
          type="button"
        >
          <Trash2 size={14} strokeWidth={1.9} />
          <span>削除</span>
        </button>
        <button
          className="history-screen__action history-screen__action--primary"
          onClick={() => onSave(meal.id)}
          type="button"
        >
          <Bookmark size={14} strokeWidth={1.9} />
          <span>保存</span>
        </button>
      </div>
    </article>
  );
}
