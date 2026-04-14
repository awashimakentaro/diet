'use client';

/**
 * web/src/app/app/history/_components/history-page-screen.tsx
 *
 * 【責務】
 * `/app/history` ルート専用のトップバー、日付チップ、履歴一覧、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/history/page.tsx から呼ばれる。
 * - web/src/features/history/use-history-screen.ts と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - web/src/features/history/components 配下と web/src/components/app-bottom-nav.tsx を利用する。
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { HistoryScreenSkeleton } from '@/components/app-skeleton';
import { AppTopBar } from '@/components/app-top-bar';
import { HistoryDateChip } from '@/features/history/components/history-date-chip';
import { HistoryEntryCard } from '@/features/history/components/history-entry-card';
import { HistoryMealEditorPanel } from '@/features/history/components/history-meal-editor-panel';
import { useHistoryScreen } from '@/features/history/hooks/use-history-screen';
import { RecordSummaryCard } from '@/components/record-summary-card';

export function HistoryPageScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    meals,
    summary,
    selectedDateValue,
    selectedDateLabel,
    feedbackMessage,
    feedbackTone,
    editingMeal,
    isSavingEdit,
    savingMealId,
    savedMealIds,
    handleSelectDateKey,
    handleShiftDate,
    handleSelectToday,
    handleDeleteMeal,
    handleOpenEditMeal,
    handleCloseEditMeal,
    handleUpdateMeal,
    handleSaveMeal,
    isLoading,
  } = useHistoryScreen();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

  return (
    <div className="history-screen">
      <AppTopBar />

      {isLoading ? (
        <main className="history-screen__main" style={{ opacity: 1 }}>
          <HistoryScreenSkeleton />
        </main>
      ) : (
        <motion.main
          animate={{ opacity: 1, y: 0 }}
          className="history-screen__main"
          initial={{ opacity: 0, y: 18 }}
          transition={sectionTransition}
        >
          <div className="history-screen__layout">
            <motion.aside
              animate={{ opacity: 1, y: 0 }}
              className="history-screen__summary-pane"
              initial={{ opacity: 0, y: 20 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.06 }}
            >
              <RecordSummaryCard summary={summary} />
            </motion.aside>

            <motion.section
              animate={{ opacity: 1, y: 0 }}
              className="history-screen__content-pane"
              initial={{ opacity: 0, y: 24 }}
              transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.1 }}
            >
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 14 }}
                transition={{ ...sectionTransition, delay: reduceMotion ? 0 : 0.14 }}
              >
                <HistoryDateChip
                  onSelectDate={handleSelectDateKey}
                  onSelectToday={handleSelectToday}
                  onShiftDate={handleShiftDate}
                  selectedDateLabel={selectedDateLabel}
                  selectedDateValue={selectedDateValue}
                />
              </motion.div>

              {feedbackMessage !== null ? (
                <p className={feedbackTone === 'error' ? 'history-screen__feedback history-screen__feedback--error' : 'history-screen__feedback'}>
                  {feedbackMessage}
                </p>
              ) : null}

              <section className="history-screen__list">
                {meals.map((meal, index) => (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    initial={{ opacity: 0, y: 18 }}
                    key={meal.id}
                    transition={{
                      ...sectionTransition,
                      delay: reduceMotion ? 0 : 0.18 + index * 0.03,
                    }}
                  >
                    <HistoryEntryCard
                      isSaved={savedMealIds.includes(meal.id)}
                      isSaving={savingMealId === meal.id}
                      meal={meal}
                      onDelete={handleDeleteMeal}
                      onEdit={handleOpenEditMeal}
                      onSave={handleSaveMeal}
                    />
                  </motion.div>
                ))}
              </section>
            </motion.section>
          </div>
        </motion.main>
      )}

      {editingMeal !== null ? (
        <HistoryMealEditorPanel
          isSaving={isSavingEdit}
          meal={editingMeal}
          onClose={handleCloseEditMeal}
          onSave={(values) => handleUpdateMeal(editingMeal.id, values)}
        />
      ) : null}
    </div>
  );
}
