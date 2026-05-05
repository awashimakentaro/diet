/* 【責務】
 * `/app/workouts` ルート専用の筋トレ管理画面を組み立てる。
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';
import { OtherWorkoutLogForm } from '@/features/workouts/components/other-workout-log-form';
import { TodayWorkoutLogList } from '@/features/workouts/components/today-workout-log-list';
import { WorkoutMenuForm } from '@/features/workouts/components/workout-menu-form';
import { WorkoutMenuList } from '@/features/workouts/components/workout-menu-list';
import { useWorkoutsScreen } from '@/features/workouts/hooks';

export function WorkoutsPageScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    formValues,
    otherWorkoutValues,
    menus,
    todayLogs,
    todayBurnedKcal,
    feedbackMessage,
    feedbackTone,
    activeMenuId,
    activeLogId,
    isLoading,
    isSaving,
    isSavingOtherWorkout,
    handleValueChange,
    handleOtherWorkoutValueChange,
    handleExerciseValueChange,
    handleAddExercise,
    handleRemoveExercise,
    handleCreateMenu,
    handleDeleteMenu,
    handleLogMenu,
    handleDeleteLog,
    handleCreateOtherWorkoutLog,
    handleSaveOtherWorkoutMenu,
  } = useWorkoutsScreen();
  const sectionTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: 'easeOut' as const };

  return (
    <div className="workouts-screen">
      <AppTopBar />

      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="workouts-screen__main"
        initial={{ opacity: 0, y: 18 }}
        transition={sectionTransition}
      >
        <section className="workouts-screen__header">
          <p className="workouts-screen__eyebrow">Workout Agent</p>
          <h1>筋トレ</h1>
        </section>

        {feedbackMessage !== null ? (
          <p className={feedbackTone === 'error' ? 'workouts-screen__feedback workouts-screen__feedback--error' : 'workouts-screen__feedback'}>
            {feedbackMessage}
          </p>
        ) : null}

        <section className="workouts-screen__grid" aria-busy={isLoading}>
          <WorkoutMenuForm
            isSaving={isSaving}
            onSubmit={() => {
              void handleCreateMenu();
            }}
            onAddExercise={handleAddExercise}
            onExerciseValueChange={handleExerciseValueChange}
            onRemoveExercise={handleRemoveExercise}
            onValueChange={handleValueChange}
            values={formValues}
          />

          <TodayWorkoutLogList
            activeLogId={activeLogId}
            burnedKcal={todayBurnedKcal}
            logs={todayLogs}
            onDeleteLog={(logId) => {
              void handleDeleteLog(logId);
            }}
          />

          <OtherWorkoutLogForm
            isSaving={isSavingOtherWorkout}
            onAddToday={() => {
              void handleCreateOtherWorkoutLog();
            }}
            onSaveMenu={() => {
              void handleSaveOtherWorkoutMenu();
            }}
            onValueChange={handleOtherWorkoutValueChange}
            values={otherWorkoutValues}
          />

          <div className="workouts-screen__list-column">
            <WorkoutMenuList
              activeMenuId={activeMenuId}
              menus={menus}
              onDeleteMenu={(menuId) => {
                void handleDeleteMenu(menuId);
              }}
              onLogMenu={(menu) => {
                void handleLogMenu(menu);
              }}
            />
          </div>
        </section>
      </motion.main>
    </div>
  );
}
