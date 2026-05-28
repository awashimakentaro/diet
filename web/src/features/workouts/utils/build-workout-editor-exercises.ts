/* 【責務】
 * ワークアウト編集フォームの種目入力を保存用の種目配列へ変換する。
 */

import type { WorkoutExercise, WorkoutExerciseFormValues } from '../types';

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function buildWorkoutEditorExercises(
  exercises: WorkoutExerciseFormValues[],
): WorkoutExercise[] | null {
  const parsedExercises: WorkoutExercise[] = [];

  for (const exercise of exercises) {
    const exerciseName = exercise.exerciseName.trim();
    const sets = parsePositiveNumber(exercise.sets);
    const reps = parsePositiveNumber(exercise.reps);
    const weightKg = Number(exercise.weightKg);
    const perSetMinutes = parsePositiveNumber(exercise.durationMinutes);

    if (
      exerciseName.length === 0
      || sets === null
      || reps === null
      || perSetMinutes === null
      || !Number.isFinite(weightKg)
      || weightKg <= 0
    ) {
      return null;
    }

    parsedExercises.push({
      exerciseName,
      sets: Math.round(sets),
      reps: Math.round(reps),
      weightKg,
      durationMinutes: Math.round(sets * perSetMinutes),
    });
  }

  return parsedExercises.length > 0 ? parsedExercises : null;
}
