'use client';

/**
 * web/src/features/history/history-screen.tsx
 *
 * 【責務】
 * History 画面全体のトップバー、日付チップ、履歴一覧、下部ナビを組み立てる。
 *
 * 【使用されるエージェント / 処理フロー】
 * - web/src/app/app/history/page.tsx から呼ばれる。
 * - use-history-screen.ts と各 UI コンポーネントを接続する。
 *
 * 【やらないこと】
 * - API 通信
 * - 永続化
 * - 認証制御
 *
 * 【他ファイルとの関係】
 * - components/history-* と app-bottom-nav.tsx を利用する。
 */

import type { JSX } from 'react';

import { AppBottomNav } from '@/components/app-bottom-nav';
import { AppTopBar } from '@/components/app-top-bar';
import { RecordSummaryCard } from '@/features/record/components/record-summary-card';

import { HistoryDateChip } from './components/history-date-chip';
import { HistoryEntryCard } from './components/history-entry-card';
import { HistoryMealEditorPanel } from './components/history-meal-editor-panel';
import { useHistoryScreen } from './use-history-screen';

export function HistoryScreen(): JSX.Element {
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
  } = useHistoryScreen();

  return (
    <div className="history-screen">
      <AppTopBar />

      <main className="history-screen__main">
        <div className="history-screen__layout">
          <aside className="history-screen__summary-pane">
            <RecordSummaryCard summary={summary} />
          </aside>

          <section className="history-screen__content-pane">
            <HistoryDateChip
              onSelectDate={handleSelectDateKey}
              onSelectToday={handleSelectToday}
              onShiftDate={handleShiftDate}
              selectedDateLabel={selectedDateLabel}
              selectedDateValue={selectedDateValue}
            />

            {feedbackMessage !== null ? (
              <p className={feedbackTone === 'error' ? 'history-screen__feedback history-screen__feedback--error' : 'history-screen__feedback'}>
                {feedbackMessage}
              </p>
            ) : null}

            <section className="history-screen__list">
              {meals.map((meal) => (
                <HistoryEntryCard
                  key={meal.id}
                  isSaved={savedMealIds.includes(meal.id)}
                  isSaving={savingMealId === meal.id}
                  meal={meal}
                  onEdit={handleOpenEditMeal}
                  onDelete={handleDeleteMeal}
                  onSave={handleSaveMeal}
                />
              ))}
            </section>
          </section>
        </div>
      </main>

      {editingMeal !== null ? (
        <HistoryMealEditorPanel
          isSaving={isSavingEdit}
          meal={editingMeal}
          onClose={handleCloseEditMeal}
          onSave={(values) => handleUpdateMeal(editingMeal.id, values)}
        />
      ) : null}

      <AppBottomNav currentPath="/app/history" />
    </div>
  );
}
