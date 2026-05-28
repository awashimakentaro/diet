/* 【責務】
 * Workout feature 内で共有する型を定義する。
 */

export type WorkoutIntensity = 'light' | 'normal' | 'hard';
export type WorkoutKind = 'strength' | 'other';

export type WorkoutExerciseFormValues = {
  exerciseName: string;
  sets: string;
  reps: string;
  weightKg: string;
  durationMinutes: string;
};

export type WorkoutExercise = {
  exerciseName: string;
  sets: number;
  reps: number;
  weightKg: number;
  durationMinutes: number;
};

export type WorkoutMenuFormValues = {
  name: string;
  exercises: WorkoutExerciseFormValues[];
  durationMinutes: string;
  intensity: WorkoutIntensity;
  note: string;
};

export type OtherWorkoutFormValues = {
  name: string;
  durationMinutes: string;
  burnedKcal: string;
  note: string;
};

export type WorkoutMenu = {
  id: string;
  kind: WorkoutKind;
  name: string;
  exercises: WorkoutExercise[];
  durationMinutes: number;
  intensity: WorkoutIntensity;
  estimatedBurnedKcal: number | null;
  note: string;
  createdAt: string;
};

export type WorkoutLog = WorkoutMenu & {
  menuId: string | null;
  burnedKcal: number;
  performedAt: string;
};
