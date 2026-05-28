/* 【責務】
 * 筋トレメニュー入力値を保存用 payload に変換する。
 */

import type { WorkoutExercise, WorkoutMenuFormValues, WorkoutIntensity } from '../types';

type WorkoutMenuPayload = {
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  intensity: WorkoutIntensity;
  note: string;
};

type BuildWorkoutMenuPayloadResult =
  | { ok: true; payload: WorkoutMenuPayload }
  | { ok: false };

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export function buildWorkoutMenuPayload(values: WorkoutMenuFormValues): BuildWorkoutMenuPayloadResult {
  const name = values.name.trim();
  const exercises: WorkoutExercise[] = [];

  for (const exercise of values.exercises) {
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
      return { ok: false };
    }

    exercises.push({
      exerciseName,
      sets: Math.round(sets),
      reps: Math.round(reps),
      weightKg,
      durationMinutes: Math.round(sets * perSetMinutes),
    });
  }

  if (
    name.length === 0
    || exercises.length === 0
  ) {
    return { ok: false };
  }

  return {
    ok: true,
    payload: {
      name,
      exercises,
      durationMinutes: exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0),
      intensity: values.intensity,
      note: values.note.trim(),
    },
  };
}
