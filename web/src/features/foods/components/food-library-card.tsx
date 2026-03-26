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
 * - web-formatters.ts の表示用関数に依存する。
 */

import { ChevronRight } from 'lucide-react';
import type { JSX } from 'react';

import type { WebLibraryEntry } from '@/domain/web-diet-schema';
import { formatKcal } from '@/lib/web-formatters';

type FoodLibraryCardProps = {
  entry: WebLibraryEntry;
  addedAt: string;
  onDelete: (entryId: string) => void;
  onReuse: (entryId: string) => void;
};

export function FoodLibraryCard({
  entry,
  addedAt,
  onDelete,
  onReuse,
}: FoodLibraryCardProps): JSX.Element {
  return (
    <article className="foods-screen__card">
      <div className="foods-screen__card-head">
        <div>
          <h2>{entry.name}</h2>
          <p>単品 / {entry.items.length}品</p>
        </div>
        <time>{addedAt}</time>
      </div>

      <p className="foods-screen__card-total">
        基準量: {entry.amount} / <strong>{formatKcal(entry.totals.kcal)}</strong>
      </p>

      <div className="foods-screen__card-actions">
        <button className="foods-screen__action foods-screen__action--edit" type="button">
          編集
        </button>
        <button
          className="foods-screen__action foods-screen__action--delete"
          onClick={() => onDelete(entry.id)}
          type="button"
        >
          削除
        </button>
        <button
          className="foods-screen__action foods-screen__action--reuse"
          onClick={() => onReuse(entry.id)}
          type="button"
        >
          今日食べた
          <ChevronRight size={14} strokeWidth={2.4} />
        </button>
      </div>
    </article>
  );
}
