'use client';

/*
 * 【責務】
 * `/app/foods` ルート専用のトップバー、検索バー、食品カード一覧、下部ナビを組み立てる。
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { FoodsScreenSkeleton } from '@/components/app-skeleton';
import { AppTopBar } from '@/components/app-top-bar';
import { FoodEntryEditorPanel } from '@/features/foods/components/editor';
import { FoodLibraryCard } from '@/features/foods/components/library-card';
import { FoodsSearchBar } from '@/features/foods/components/search-bar';
import { useFoodsScreen } from '@/features/foods/hooks';

export function FoodsPageScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    visibleEntries,
    searchTerm,
    feedbackMessage,
    feedbackTone,
    savingEntryId,
    editingEntry,
    editingForm,
    editingItemFields,
    editingDraftTotals,
    isSavingEdit,
    handleSearchChange,
    handleAddFood,
    handleOpenEditor,
    handleCloseEditor,
    handleAddEditorItem,
    handleRemoveEditorItem,
    handleSaveEditor,
    handleDeleteEntry,
    handleReuseEntry,
    isLoading,
  } = useFoodsScreen();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

  return (
    <div className="foods-screen">
      <AppTopBar />

      {isLoading ? (
        <main className="foods-screen__main" style={{ opacity: 1 }}>
          <FoodsScreenSkeleton />
        </main>
      ) : (
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
            <p className="eyebrow">{feedbackMessage}</p>
          ) : null}

          <section className="foods-screen__list">
            {visibleEntries.length === 0 ? (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="foods-screen__empty"
                initial={{ opacity: 0, y: 20 }}
                transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.1 }}
              >
                <h2>{searchTerm.trim().length > 0 ? '一致する食品がありません' : '食品ライブラリはまだ空です'}</h2>
                <p>
                  {searchTerm.trim().length > 0
                    ? '検索語を短くするか、よく使う食品として新しく追加できます。'
                    : '鶏むね丼、プロテイン、いつもの朝食などを保存しておくと、次回からすぐ再利用できます。'}
                </p>
                <button className="foods-screen__empty-action" onClick={handleAddFood} type="button">
                  食品を追加する
                </button>
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
                    onEdit={handleOpenEditor}
                    onReuse={handleReuseEntry}
                  />
                </motion.div>
              ))
            )}
          </section>
        </motion.main>
      )}

      {editingEntry !== null ? (
        <FoodEntryEditorPanel
          draftTotals={editingDraftTotals}
          feedbackMessage={feedbackTone === 'error' ? feedbackMessage : null}
          feedbackTone={feedbackTone}
          form={editingForm}
          isSaving={isSavingEdit}
          itemFields={editingItemFields}
          onAddItem={handleAddEditorItem}
          onClose={handleCloseEditor}
          onConfirm={() => {
            void handleSaveEditor();
          }}
          onRemoveItem={handleRemoveEditorItem}
        />
      ) : null}
    </div>
  );
}
