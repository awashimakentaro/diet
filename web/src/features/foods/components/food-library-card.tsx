/**
 * web/src/features/foods/components/food-library-card.tsx
 *
 * 【責務】
 * Foods 画面の1件分の食品ライブラリカードを描画する。
 * 横長のフラットなカードレイアウト。
 */

import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

type FoodLibraryCardProps = {
  entry: WebLibraryEntry;
  isSaving: boolean;
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
  onReuse: (entryId: string) => void;
};

export function FoodLibraryCard({
  entry,
  isSaving,
  onEdit,
  onDelete,
  onReuse,
}: FoodLibraryCardProps): JSX.Element {
  return (
    <article className="food-card">
      <div className="food-card__row">
        <div className="food-card__main">
          <h3 className="food-card__name">{entry.name}</h3>

          <div className="food-card__metrics">
            <span className="food-card__macro food-card__macro--p">
              P {entry.totals.protein}g
            </span>
            <span className="food-card__macro food-card__macro--f">
              F {entry.totals.fat}g
            </span>
            <span className="food-card__macro food-card__macro--c">
              C {entry.totals.carbs}g
            </span>
            <div className="food-card__kcal">
              <strong>{entry.totals.kcal}</strong>
              <span>kcal</span>
            </div>
          </div>
        </div>

        <div className="food-card__actions">
          <button
            aria-label="食品を編集"
            className="food-card__btn food-card__btn--edit"
            onClick={() => onEdit(entry.id)}
            type="button"
          >
            <Pencil size={13} strokeWidth={2} />
          </button>
          <button
            aria-label="食品を削除"
            className="food-card__btn food-card__btn--delete"
            onClick={() => onDelete(entry.id)}
            type="button"
          >
            <Trash2 size={13} strokeWidth={2} />
          </button>
          <button
            className="food-card__btn food-card__btn--reuse"
            disabled={isSaving}
            onClick={() => onReuse(entry.id)}
            type="button"
          >
            {isSaving ? (
              <>
                <span className="food-card__spinner" />
                <span>追加中...</span>
              </>
            ) : (
              <>
                <Bookmark size={13} strokeWidth={2} />
                <span>今日食べた</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
