/*
 * 【責務】
 * Foods 画面上部の検索入力と追加ボタンを描画する。
 */

'use client';

import { Plus, Search } from 'lucide-react';
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
        <Plus aria-hidden="true" size={16} strokeWidth={2.4} />
        食品を追加
      </button>
    </section>
  );
}
