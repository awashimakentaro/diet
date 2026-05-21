'use client';

/*
 * 【責務】
 * `/app/foods` ルート専用のトップバー、検索バー、食品カード一覧、下部ナビを組み立てる。
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';
import { FoodEntryEditorPanel } from '@/features/foods/components/editor';
import { FoodLibraryCard } from '@/features/foods/components/library-card';
import { FoodsSearchBar } from '@/features/foods/components/search-bar';
import { useFoodsScreen } from '@/features/foods/hooks';
import { WorkoutLogEditorPanel } from '@/features/workouts/components/workout-log-editor-panel';
import { WorkoutMenuLibraryCard } from '@/features/workouts/components/workout-menu-library-card';

export function FoodsPageScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    visibleEntries,
    visibleWorkoutMenus,
    activeLibraryView,
    searchTerm,
    feedbackMessage,
    feedbackTone,
    savingEntryId,
    activeWorkoutMenuId,
    editingWorkoutMenu,
    workoutMenuEditorValues,
    editingEntry,
    editingForm,
    editingItemFields,
    editingDraftTotals,
    isSavingEdit,
    isSavingWorkoutMenuEdit,
    handleSelectLibraryView,
    handleSearchChange,
    handleOpenEditor,
    handleCloseEditor,
    handleAddEditorItem,
    handleRemoveEditorItem,
    handleSaveEditor,
    handleDeleteEntry,
    handleReuseEntry,
    handleDeleteWorkoutMenu,
    handleOpenWorkoutMenuEditor,
    handleCloseWorkoutMenuEditor,
    handleWorkoutMenuEditorValueChange,
    handleSaveWorkoutMenuEditor,
    handleReuseWorkoutMenu,
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
              onSearchChange={handleSearchChange}
              searchTerm={searchTerm}
            />
          </motion.div>

          {feedbackMessage !== null ? (
            <p className="eyebrow">{feedbackMessage}</p>
          ) : null}

          <div className="foods-screen__view-switch" role="tablist" aria-label="保存済みデータ">
            <button
              aria-selected={activeLibraryView === 'foods'}
              className={activeLibraryView === 'foods' ? 'foods-screen__view-button foods-screen__view-button--active' : 'foods-screen__view-button'}
              onClick={() => handleSelectLibraryView('foods')}
              role="tab"
              type="button"
            >
              食品
            </button>
            <button
              aria-selected={activeLibraryView === 'workouts'}
              className={activeLibraryView === 'workouts' ? 'foods-screen__view-button foods-screen__view-button--active' : 'foods-screen__view-button'}
              onClick={() => handleSelectLibraryView('workouts')}
              role="tab"
              type="button"
            >
              筋トレメニュー
            </button>
          </div>

          <section className="foods-screen__list">
            {activeLibraryView === 'workouts' ? (
              visibleWorkoutMenus.length === 0 ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="foods-screen__empty"
                  initial={{ opacity: 0, y: 20 }}
                  transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.1 }}
                >
                  <h2>{searchTerm.trim().length > 0 ? '一致する筋トレメニューがありません' : '筋トレメニューはまだ空です'}</h2>
                  <p>
                    {searchTerm.trim().length > 0
                      ? '検索語を短くするか、履歴タブからワークアウトを保存できます。'
                      : '履歴タブで実施したワークアウトを保存すると、次回からすぐ再利用できます。'}
                  </p>
                </motion.div>
              ) : (
                visibleWorkoutMenus.map((menu, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 18 }}
                    key={menu.id}
                    transition={{
                      ...sectionTransition,
                      delay: reduceMotion ? 0 : 0.12 + index * 0.03,
                    }}
                  >
                    <WorkoutMenuLibraryCard
                      isSaving={activeWorkoutMenuId === menu.id}
                      menu={menu}
                      onDelete={(menuId) => {
                        void handleDeleteWorkoutMenu(menuId);
                      }}
                      onEdit={handleOpenWorkoutMenuEditor}
                      onReuse={(targetMenu) => {
                        void handleReuseWorkoutMenu(targetMenu);
                      }}
                    />
                  </motion.div>
                ))
              )
            ) : visibleEntries.length === 0 ? (
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

      {editingWorkoutMenu !== null ? (
        <WorkoutLogEditorPanel
          isSaving={isSavingWorkoutMenuEdit}
          onChange={handleWorkoutMenuEditorValueChange}
          onClose={handleCloseWorkoutMenuEditor}
          onSave={() => {
            void handleSaveWorkoutMenuEditor();
          }}
          title="筋トレメニューを編集"
          values={workoutMenuEditorValues}
        />
      ) : null}
    </div>
  );
}
