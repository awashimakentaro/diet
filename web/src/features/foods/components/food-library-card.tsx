/**
 * web/src/features/foods/components/food-library-card.tsx
 *
 * 【責務】
 * Foods 画面の1件分の食品ライブラリカードを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - foods-screen.tsx から呼ばれる。
 * - 食品データと操作ハンドラを受け取る。
 *
 * 【やらないこと】
 * - データ取得
 * - 検索条件管理
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebLibraryEntry 型に依存する。
 */

import { Bookmark, Pencil, Trash2 } from 'lucide-react';
import type { JSX } from 'react';

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

type FoodLibraryCardProps = {
  entry: WebLibraryEntry;
  isSaving: boolean;
  onDelete: (entryId: string) => void;
  onReuse: (entryId: string) => void;
};

export function FoodLibraryCard({
  entry,
  isSaving,
  onDelete,
  onReuse,
}: FoodLibraryCardProps): JSX.Element {
  return (
    <article className="foods-screen__card">
      <div className="foods-screen__card-head">
        <div className="foods-screen__meal-meta">
          <h2>{entry.name}</h2>
          <p>
            P {entry.totals.protein}g
            <span>•</span>
            F {entry.totals.fat}g
            <span>•</span>
            C {entry.totals.carbs}g
          </p>
        </div>

        <div className="foods-screen__kcal-box">
          <strong>{entry.totals.kcal}</strong>
          <span>kcal</span>
        </div>
      </div>

      {entry.items.length > 0 ? (
        <div className="foods-screen__item-list">
          {entry.items.slice(0, 3).map((item) => (
            <div className="foods-screen__item-row" key={item.id}>
              <span>{item.name}</span>
              <div>
                <strong>{item.kcal} kcal</strong>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="foods-screen__card-actions">
        <button className="foods-screen__action foods-screen__action--edit" type="button">
          <Pencil size={14} strokeWidth={1.9} />
          編集
        </button>
        <button
          className="foods-screen__action foods-screen__action--delete"
          onClick={() => onDelete(entry.id)}
          type="button"
        >
          <Trash2 size={14} strokeWidth={1.9} />
          削除
        </button>
        <button
          className="foods-screen__action foods-screen__action--reuse"
          disabled={isSaving}
          onClick={() => onReuse(entry.id)}
          type="button"
        >
          {isSaving ? (
            <>
              <span className="foods-screen__action-spinner" />
              <span>追加中...</span>
            </>
          ) : (
            <>
              <Bookmark size={14} strokeWidth={1.9} />
              <span>今日食べた</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
