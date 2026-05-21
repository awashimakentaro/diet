'use client';

/*
 * 【責務】
 * `/app/history` ルート専用のトップバー、日付チップ、履歴一覧、下部ナビを組み立てる。
 */

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';
import { HistoryDateChip } from '@/features/history/components/date-chip';
import { HistoryEntryCard } from '@/features/history/components/entry-card';
import { HistoryMealEditorPanel } from '@/features/history/components/editor';
import { useHistoryScreen } from '@/features/history/hooks';
import { TodayWorkoutLogList } from '@/features/workouts/components/today-workout-log-list';
import { WorkoutLogEditorPanel } from '@/features/workouts/components/workout-log-editor-panel';
import { WorkoutLogHistoryCard } from '@/features/workouts/components/workout-log-history-card';
import { RecordSummaryCard } from '@/components/record-summary-card';

export function HistoryPageScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    meals,
    workoutLogs,
    summary,
    selectedDateValue,
    selectedDateLabel,
    activeView,
    feedbackMessage,
    feedbackTone,
    editingMeal,
    isSavingEdit,
    savingMealId,
    activeWorkoutLogId,
    savingWorkoutLogId,
    editingWorkoutLog,
    workoutEditorValues,
    isSavingWorkoutEdit,
    savedMealIds,
    workoutBurnedKcal,
    handleSelectView,
    handleSelectDateKey,
    handleShiftDate,
    handleSelectToday,
    handleDeleteMeal,
    handleOpenEditMeal,
    handleCloseEditMeal,
    handleUpdateMeal,
    handleSaveMeal,
    handleDeleteWorkoutLog,
    handleOpenEditWorkoutLog,
    handleCloseEditWorkoutLog,
    handleWorkoutEditorValueChange,
    handleUpdateWorkoutLog,
    handleSaveWorkoutLog,
  } = useHistoryScreen();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

  return (
    <div className="history-screen">
      <AppTopBar />

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

              <TodayWorkoutLogList
                activeLogId={activeWorkoutLogId}
                burnedKcal={workoutBurnedKcal}
                eyebrow="Workout History"
                logs={workoutLogs}
                onDeleteLog={(logId) => {
                  void handleDeleteWorkoutLog(logId);
                }}
                showLogs={false}
                title={`${selectedDateLabel} のワークアウト`}
              />
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

              <div className="history-screen__view-switch" role="tablist" aria-label="履歴表示">
                <button
                  aria-selected={activeView === 'foods'}
                  className={activeView === 'foods' ? 'history-screen__view-button history-screen__view-button--active' : 'history-screen__view-button'}
                  onClick={() => handleSelectView('foods')}
                  role="tab"
                  type="button"
                >
                  食品
                </button>
                <button
                  aria-selected={activeView === 'workouts'}
                  className={activeView === 'workouts' ? 'history-screen__view-button history-screen__view-button--active' : 'history-screen__view-button'}
                  onClick={() => handleSelectView('workouts')}
                  role="tab"
                  type="button"
                >
                  トレーニング
                </button>
              </div>

              {activeView === 'foods' ? (
                <section className="history-screen__list" role="tabpanel">
                  {meals.length === 0 ? (
                    <p className="workouts-screen__empty-copy">この日の食品記録はまだありません。</p>
                  ) : (
                    meals.map((meal, index) => (
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
                    ))
                  )}
                </section>
              ) : (
                <section className="history-screen__list" role="tabpanel">
                  {workoutLogs.length === 0 ? (
                    <p className="workouts-screen__empty-copy">この日のワークアウト記録はまだありません。</p>
                  ) : (
                    workoutLogs.map((log, index) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 18 }}
                        key={log.id}
                        transition={{
                          ...sectionTransition,
                          delay: reduceMotion ? 0 : 0.18 + index * 0.03,
                        }}
                      >
                        <WorkoutLogHistoryCard
                          isSaving={savingWorkoutLogId === log.id}
                          log={log}
                          onDelete={(logId) => {
                            void handleDeleteWorkoutLog(logId);
                          }}
                          onEdit={handleOpenEditWorkoutLog}
                          onSave={(targetLog) => {
                            void handleSaveWorkoutLog(targetLog);
                          }}
                        />
                      </motion.div>
                    ))
                  )}
                </section>
              )}
            </motion.section>
          </div>
      </motion.main>

      {editingMeal !== null ? (
        <HistoryMealEditorPanel
          isSaving={isSavingEdit}
          meal={editingMeal}
          onClose={handleCloseEditMeal}
          onSave={(values) => handleUpdateMeal(editingMeal.id, values)}
        />
      ) : null}

      {editingWorkoutLog !== null ? (
        <WorkoutLogEditorPanel
          isSaving={isSavingWorkoutEdit}
          onChange={handleWorkoutEditorValueChange}
          onClose={handleCloseEditWorkoutLog}
          onSave={() => {
            void handleUpdateWorkoutLog();
          }}
          values={workoutEditorValues}
        />
      ) : null}
    </div>
  );
}
