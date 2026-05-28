/* 【責務】
 * 筋トレ消費カロリー推定 API の入出力スキーマを定義する。
 */

import { z } from 'zod';

export const workoutCalorieEstimateRequestSchema = z.object({
  menuName: z.string().min(1),
  exercises: z.array(z.object({
    exerciseName: z.string().min(1),
    sets: z.number().positive(),
    reps: z.number().positive(),
    weightKg: z.number().nonnegative(),
    durationMinutes: z.number().positive(),
  })).min(1),
  durationMinutes: z.number().positive().nullable().optional(),
  intensity: z.enum(['light', 'normal', 'hard']),
  currentWeightKg: z.number().positive(),
  age: z.number().positive().nullable().optional(),
  gender: z.string().nullable().optional(),
  heightCm: z.number().positive().nullable().optional(),
  chargeUsage: z.boolean().optional(),
});

export const workoutCalorieEstimateResponseSchema = z.object({
  burnedKcal: z.number().nonnegative(),
  source: z.enum(['openai', 'fallback']),
  warning: z.string().nullable(),
});

export type WorkoutCalorieEstimateRequest = z.infer<typeof workoutCalorieEstimateRequestSchema>;
export type WorkoutCalorieEstimateResponse = z.infer<typeof workoutCalorieEstimateResponseSchema>;
