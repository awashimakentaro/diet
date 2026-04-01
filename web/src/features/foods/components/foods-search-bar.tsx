'use client';

/**
 * web/src/features/foods/components/foods-search-bar.tsx
 *
 * 【責務】
 * Foods 画面上部の検索入力と追加ボタンを描画する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/foods/_components/foods-page-screen.tsx から呼ばれる。
 * - 親から渡された検索値と追加ハンドラを使う。
 *
 * 【やらないこと】
 * - データ検索
 * - 永続化
 * - 一覧カード描画
 *
 * 【他ファイルとの関係】
 * - use-foods-screen.ts の state とハンドラに依存する。
 */

import { Search } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

type FoodsSearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddFood: () => void;
};

export function FoodsSearchBar({
  searchTerm,
  onSearchChange,
  onAddFood,
}: FoodsSearchBarProps): JSX.Element {
  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onSearchChange(event.target.value);
  }

  return (
    <section className="foods-screen__toolbar">
      <label className="foods-screen__search-field">
        <Search className="foods-screen__search-icon" size={18} strokeWidth={2.3} />
        <input
          onChange={handleChange}
          placeholder="食品名を検索"
          type="search"
          value={searchTerm}
        />
      </label>

      <button
        className="foods-screen__add-button"
        onClick={onAddFood}
        type="button"
      >
        追加
      </button>
    </section>
  );
}
