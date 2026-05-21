/*
 * 【責務】
 * Foods 画面上部の検索入力を描画する。
 */

'use client';

import { Search } from 'lucide-react';
import type { ChangeEvent, JSX } from 'react';

type FoodsSearchBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export function FoodsSearchBar({
  searchTerm,
  onSearchChange,
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

    </section>
  );
}
