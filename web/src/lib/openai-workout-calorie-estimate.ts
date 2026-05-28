/* 【責務】
 * 筋トレメニューを OpenAI へ送り、消費カロリー推定値へ整形する。
 */

import type {
  WorkoutCalorieEstimateRequest,
  WorkoutCalorieEstimateResponse,
} from '@/features/workouts/schemas/workout-calorie-estimate-schema';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT =
  'You are a certified exercise physiology assistant. Estimate the METs value for a resistance training workout. Respond ONLY with valid JSON matching {"mets":number,"warning":string|null}. Use the user profile, exercise selection, sets, reps, external load, total training volume, duration, rest density, and intensity. Do not estimate calories. Return a realistic METs value for the whole workout, usually between 3.0 and 8.0 for resistance training.';

type RawWorkoutEstimate = {
  mets?: unknown;
  warning?: unknown;
};

function resolveDurationMinutes(payload: WorkoutCalorieEstimateRequest): number {
  const explicitMinutes = payload.exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0);
  const durationMinutes = payload.durationMinutes ?? explicitMinutes;

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    throw new Error('トレーニング時間を計算できませんでした。');
  }

  return durationMinutes;
}

function calculateBurnedKcalFromMets(
  payload: WorkoutCalorieEstimateRequest,
  mets: number,
): number {
  const durationHours = resolveDurationMinutes(payload) / 60;

  return Math.max(0, Math.round(mets * payload.currentWeightKg * durationHours));
}

function extractJson(content: string): string {
  if (content.startsWith('```')) {
    const match = content.match(/```(?:json)?\n([\s\S]*?)```/);

    if (match?.[1]) {
      return match[1];
    }
  }

  return content;
}

function parseEstimate(content: string): RawWorkoutEstimate | null {
  try {
    return JSON.parse(extractJson(content.trim())) as RawWorkoutEstimate;
  } catch {
    return null;
  }
}

function normalizeEstimate(
  payload: WorkoutCalorieEstimateRequest,
  raw: RawWorkoutEstimate,
): WorkoutCalorieEstimateResponse | null {
  const mets = Number(raw.mets);

  if (!Number.isFinite(mets) || mets <= 0) {
    return null;
  }

  return {
    burnedKcal: calculateBurnedKcalFromMets(payload, mets),
    source: 'openai',
    warning: typeof raw.warning === 'string' && raw.warning.trim().length > 0
      ? raw.warning.trim()
      : null,
  };
}

function buildUserPrompt(payload: WorkoutCalorieEstimateRequest): string {
  const exercises = payload.exercises
    .map((exercise, index) => (
      `${index + 1}. ${exercise.exerciseName}: ${exercise.sets} sets x ${exercise.reps} reps, ${exercise.weightKg} kg`
      + `, ${exercise.durationMinutes} minutes`
    ))
    .join('\n');
  const totalSets = payload.exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const totalReps = payload.exercises.reduce((sum, exercise) => sum + exercise.sets * exercise.reps, 0);
  const totalVolumeKg = payload.exercises.reduce(
    (sum, exercise) => sum + exercise.sets * exercise.reps * exercise.weightKg,
    0,
  );
  const totalExerciseMinutes = payload.exercises.reduce((sum, exercise) => sum + exercise.durationMinutes, 0);

  return [
    `Menu: ${payload.menuName}`,
    `Body weight: ${payload.currentWeightKg} kg`,
    `Age: ${payload.age ?? 'unknown'}`,
    `Gender: ${payload.gender ?? 'unknown'}`,
    `Height: ${payload.heightCm === null || payload.heightCm === undefined ? 'unknown' : `${payload.heightCm} cm`}`,
    `Total duration: ${payload.durationMinutes === null || payload.durationMinutes === undefined ? `${totalExerciseMinutes} minutes from per-exercise durations` : `${payload.durationMinutes} minutes`}`,
    `Intensity: ${payload.intensity}. Assume every set is performed close to muscular failure.`,
    `Total sets: ${totalSets}`,
    `Total reps: ${totalReps}`,
    `Total external volume: ${totalVolumeKg} kg`,
    `Per-exercise durations total: ${totalExerciseMinutes} minutes`,
    'Important: estimate this exact menu. Similar duration alone is not enough; heavier and higher-volume menus should generally burn more than lighter, lower-volume menus.',
    'Exercises:',
    exercises,
  ].join('\n');
}

export async function estimateWorkoutCalories(
  payload: WorkoutCalorieEstimateRequest,
): Promise<WorkoutCalorieEstimateResponse> {
  const apiKey =
    process.env.OPENAI_API_KEY ?? process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。');
  }

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(payload) },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI推定に失敗しました。status: ${response.status}`);
    }

    const responsePayload = await response.json();
    const content = responsePayload?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error('OpenAI推定の応答形式が不正です。');
    }

    const parsed = parseEstimate(content);

    if (parsed === null) {
      throw new Error('OpenAI推定のJSON解析に失敗しました。');
    }

    const estimate = normalizeEstimate(payload, parsed);

    if (estimate === null) {
      throw new Error('OpenAI推定のMETs値が不正です。');
    }

    return estimate;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('OpenAI推定に失敗しました。');
  }
}
