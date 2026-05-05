/* 【責務】
 * DB 行の筋トレ種目 JSON を WorkoutExercise 配列へ正規化する。
 */

import type { WorkoutExercise } from '../types';

type LegacyExerciseValues = {
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
};

type RawWorkoutExercise = {
  exerciseName?: unknown;
  sets?: unknown;
  reps?: unknown;
  weightKg?: unknown;
};

function isRawWorkoutExercise(value: unknown): value is RawWorkoutExercise {
  return typeof value === 'object' && value !== null;
}

function toWorkoutExercise(value: unknown): WorkoutExercise | null {
  if (!isRawWorkoutExercise(value)) {
    return null;
  }

  const exerciseName = typeof value.exerciseName === 'string' ? value.exerciseName.trim() : '';
  const sets = Number(value.sets);
  const reps = Number(value.reps);
  const weightKg = Number(value.weightKg);

  if (
    exerciseName.length === 0
    || !Number.isFinite(sets)
    || !Number.isFinite(reps)
    || !Number.isFinite(weightKg)
  ) {
    return null;
  }

  return {
    exerciseName,
    sets,
    reps,
    weightKg,
  };
}

export function normalizeWorkoutExercises(
  value: unknown,
  legacy: LegacyExerciseValues,
): WorkoutExercise[] {
  if (Array.isArray(value)) {
    const exercises = value
      .map(toWorkoutExercise)
      .filter((exercise): exercise is WorkoutExercise => exercise !== null);

    if (exercises.length > 0) {
      return exercises;
    }
  }

  return [legacy];
}
