/* 【責務】
 * `/app/workouts` ルート専用の筋トレ管理画面を組み立てる。
 */

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { JSX } from 'react';

import { AppTopBar } from '@/components/app-top-bar';
import { OtherWorkoutLogForm } from '@/features/workouts/components/other-workout-log-form';
import { WorkoutMenuForm } from '@/features/workouts/components/workout-menu-form';
import { useWorkoutsScreen } from '@/features/workouts/hooks';

export function WorkoutsPageScreen(): JSX.Element {
  const reduceMotion = useReducedMotion();
  const {
    formValues,
    otherWorkoutValues,
    feedbackMessage,
    feedbackTone,
    isSaving,
    isSavingOtherWorkout,
    handleValueChange,
    handleOtherWorkoutValueChange,
    handleExerciseValueChange,
    handleAddExercise,
    handleRemoveExercise,
    handleCreateMenuLog,
    handleCreateOtherWorkoutLog,
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
        {feedbackMessage !== null ? (
          <p className={feedbackTone === 'error' ? 'workouts-screen__feedback workouts-screen__feedback--error' : 'workouts-screen__feedback'}>
            {feedbackMessage}
          </p>
        ) : null}

        <section className="workouts-screen__grid">
          <div className="workouts-screen__menu-column">
            <WorkoutMenuForm
              isSaving={isSaving}
              onAddExercise={handleAddExercise}
              onExerciseValueChange={handleExerciseValueChange}
              onRemoveExercise={handleRemoveExercise}
              onValueChange={handleValueChange}
              onLogToday={() => {
                void handleCreateMenuLog();
              }}
              values={formValues}
            />

            <OtherWorkoutLogForm
              isSaving={isSavingOtherWorkout}
              onAddToday={() => {
                void handleCreateOtherWorkoutLog();
              }}
              onValueChange={handleOtherWorkoutValueChange}
              values={otherWorkoutValues}
            />
          </div>
        </section>
      </motion.main>
    </div>
  );
}
