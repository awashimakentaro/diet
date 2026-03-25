'use client';

/**
 * web/src/features/foods/foods-screen.tsx
 *
 * 【責務】
 * Foods 画面全体のトップバー、検索バー、食品カード一覧、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/foods/page.tsx から呼ばれる。
 * - use-foods-screen.ts と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - components/foods-* と app-bottom-nav.tsx を利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { FoodLibraryCard } from './components/food-library-card';
import { FoodsSearchBar } from './components/foods-search-bar';
import { useFoodsScreen } from './use-foods-screen';

export function FoodsScreen(): JSX.Element {
  const {
    visibleEntries,
    searchTerm,
    feedbackMessage,
    handleSearchChange,
    handleAddFood,
    handleDeleteEntry,
    handleReuseEntry,
  } = useFoodsScreen();

  return (
    <div className="foods-screen">
      <AppTopBar />

      <main className="foods-screen__main">
        <FoodsSearchBar
          onAddFood={handleAddFood}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        />

        {feedbackMessage !== null ? (
          <p className="foods-screen__feedback">{feedbackMessage}</p>
        ) : null}

        <section className="foods-screen__list">
          {visibleEntries.length === 0 ? (
            <div className="foods-screen__empty">
              <h2>一致する食品がありません</h2>
              <p>検索語を変えてもう一度試してください。</p>
            </div>
          ) : (
            visibleEntries.map((entry) => (
              <FoodLibraryCard
                addedAt={entry.addedAt}
                entry={entry}
                key={entry.id}
                onDelete={handleDeleteEntry}
                onReuse={handleReuseEntry}
              />
            ))
          )}
        </section>
      </main>

      <AppBottomNav currentPath="/app/foods" />
    </div>
  );
}
