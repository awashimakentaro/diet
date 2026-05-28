/* 【責務】
 * workout_menus の行を WorkoutMenu に変換する。
 */

import type { WorkoutIntensity, WorkoutKind, WorkoutMenu } from '../types';
import { normalizeWorkoutExercises } from './normalize-workout-exercises';

type WorkoutMenuRow = {
  id: string;
  workout_kind?: string | null;
  name: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number | string;
  exercises?: unknown;
  duration_minutes: number;
  intensity: string;
  estimated_burned_kcal: number | string | null;
  note: string | null;
  created_at: string;
};

function toWorkoutIntensity(value: string): WorkoutIntensity {
  if (value === 'light' || value === 'hard') {
    return value;
  }

  return 'normal';
}

function toWorkoutKind(value: string | null | undefined): WorkoutKind {
  return value === 'other' ? 'other' : 'strength';
}

export function mapWorkoutMenuRow(row: WorkoutMenuRow): WorkoutMenu {
  return {
    id: row.id,
    kind: toWorkoutKind(row.workout_kind),
    name: row.name,
    exercises: normalizeWorkoutExercises(row.exercises, {
      exerciseName: row.exercise_name,
      sets: row.sets,
      reps: row.reps,
      weightKg: Number(row.weight_kg),
      durationMinutes: row.duration_minutes,
    }),
    durationMinutes: row.duration_minutes,
    intensity: toWorkoutIntensity(row.intensity),
    estimatedBurnedKcal: row.estimated_burned_kcal === null ? null : Number(row.estimated_burned_kcal),
    note: row.note ?? '',
    createdAt: row.created_at,
  };
}
