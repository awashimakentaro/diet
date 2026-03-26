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

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';

import { FoodLibraryCard } from './components/food-library-card';
import { FoodsSearchBar } from './components/foods-search-bar';
import { useFoodsScreen } from './use-foods-screen';

export function FoodsScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    visibleEntries,
    searchTerm,
    feedbackMessage,
    savingEntryId,
    handleSearchChange,
    handleAddFood,
    handleDeleteEntry,
    handleReuseEntry,
  } = useFoodsScreen();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

  return (
    <div className="foods-screen">
      <AppTopBar />

      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="foods-screen__main"
        initial={{ opacity: 0, y: 18 }}
        transition={sectionTransition}
      >
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.06 }}
        >
          <FoodsSearchBar
            onAddFood={handleAddFood}
            onSearchChange={handleSearchChange}
            searchTerm={searchTerm}
          />
        </motion.div>

        {feedbackMessage !== null ? (
          <p className="foods-screen__feedback">{feedbackMessage}</p>
        ) : null}

        <section className="foods-screen__list">
          {visibleEntries.length === 0 ? (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="foods-screen__empty"
              initial={{ opacity: 0, y: 20 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.1 }}
            >
              <h2>一致する食品がありません</h2>
              <p>検索語を変えてもう一度試してください。</p>
            </motion.div>
          ) : (
            visibleEntries.map((entry, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 18 }}
                key={entry.id}
                transition={{
                  ...sectionTransition,
                  delay: reduceMotion ? 0 : 0.12 + index * 0.03,
                }}
              >
                <FoodLibraryCard
                  entry={entry}
                  isSaving={savingEntryId === entry.id}
                  onDelete={handleDeleteEntry}
                  onReuse={handleReuseEntry}
                />
              </motion.div>
            ))
          )}
        </section>
      </motion.main>

      <AppBottomNav currentPath="/app/foods" />
    </div>
  );
}
