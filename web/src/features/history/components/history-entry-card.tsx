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
 * - web-diet-schema.ts の WebMeal 型に依存する。
 */

import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WebMeal } from '@/domain/web-diet-schema';

type HistoryEntryCardProps = {
  meal: WebMeal;
  isSaving: boolean;
  isSaved: boolean;
  onEdit: (mealId: string) => void;
  onDelete: (mealId: string) => void;
  onSave: (mealId: string) => void;
};

export function HistoryEntryCard({
  meal,
  isSaving,
  isSaved,
  onEdit,
  onDelete,
  onSave,
}: HistoryEntryCardProps): JSX.Element {
  const firstItem = meal.items[0];

  return (
    <article className="history-screen__card app-card">

      <div className="history-screen__card-head">
        <div className="history-screen__meal-meta">
          <h2>{meal.menuName}</h2>
        </div>
        <div className="history-screen__kcal-box">
          <strong>{meal.totals.kcal}</strong>
          <span>kcal</span>
        </div>
      </div>

      <div className="food-card__metrics">
        <span className="food-card__macro food-card__macro--p">
          P {meal.totals.protein}g
        </span>
        <span className="food-card__macro food-card__macro--f">
          F {meal.totals.fat}g
        </span>
        <span className="food-card__macro food-card__macro--c">
          C {meal.totals.carbs}g
        </span>
      </div>

      {meal.items.length > 0 ? (
        <div className="history-screen__item-list">
          {meal.items.slice(0, 3).map((item) => (
            <div className="history-screen__item-row" key={item.id}>
              <span>{item.name}</span>
              <div>
                <strong>{item.kcal} kcal</strong>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="history-screen__item-row">
          <span>{firstItem?.name ?? meal.menuName}</span>
          <div>
            <strong>{firstItem?.kcal ?? meal.totals.kcal} kcal</strong>
          </div>
        </div>
      )}

      <div className="history-screen__actions">
        <button
          className="history-screen__action history-screen__action--edit"
          onClick={() => onEdit(meal.id)}
          type="button"
        >
          <Pencil size={14} strokeWidth={1.9} />
          <span>編集</span>
        </button>
        <button
          className="history-screen__action history-screen__action--delete"
          onClick={() => onDelete(meal.id)}
          type="button"
        >
          <Trash2 size={14} strokeWidth={1.9} />
          <span>削除</span>
        </button>
        <button
          className="history-screen__action history-screen__action--primary"
          disabled={isSaving || isSaved}
          onClick={() => onSave(meal.id)}
          type="button"
        >
          {isSaved ? (
            <>
              <Bookmark size={14} strokeWidth={1.9} />
              <span>保存済み</span>
            </>
          ) : isSaving ? (
            <>
              <span className="history-screen__action-spinner" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Bookmark size={14} strokeWidth={1.9} />
              <span>保存</span>
            </>
          )}
        </button>
      </div>


    </article>
  );
}
