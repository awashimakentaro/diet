/* 【責務】
 * 筋トレメニューを OpenAI へ送り、消費カロリー推定値へ整形する。
 */

import type {
  WorkoutCalorieEstimateRequest,
  WorkoutCalorieEstimateResponse,
} from '@/features/workouts/schemas/workout-calorie-estimate-schema';
import { calculateWorkoutBurnedKcal } from '@/features/workouts/utils/calculate-workout-burned-kcal';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';
const SYSTEM_PROMPT =
  'You are a certified exercise physiology assistant. Estimate calories burned for a resistance training workout. Respond ONLY with valid JSON matching {"burnedKcal":number,"warning":string|null}. Consider body weight, exercise selection, sets, reps, external load, duration, and intensity. Return one practical estimate for the whole workout, rounded to the nearest kcal.';

type RawWorkoutEstimate = {
  burnedKcal?: unknown;
  warning?: unknown;
};

function buildFallbackEstimate(
  payload: WorkoutCalorieEstimateRequest,
): WorkoutCalorieEstimateResponse {
  return {
    burnedKcal: calculateWorkoutBurnedKcal({
      intensity: payload.intensity,
      weightKg: payload.currentWeightKg,
      durationMinutes: payload.durationMinutes,
    }),
    source: 'fallback',
    warning: 'OpenAI 推定に失敗したため、METs ベースの概算を保存しました。',
  };
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

function normalizeEstimate(raw: RawWorkoutEstimate): WorkoutCalorieEstimateResponse | null {
  const burnedKcal = Number(raw.burnedKcal);

  if (!Number.isFinite(burnedKcal) || burnedKcal < 0) {
    return null;
  }

  return {
    burnedKcal: Math.round(burnedKcal),
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
    ))
    .join('\n');

  return [
    `Menu: ${payload.menuName}`,
    `Body weight: ${payload.currentWeightKg} kg`,
    `Duration: ${payload.durationMinutes} minutes`,
    `Intensity: ${payload.intensity}`,
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
    return buildFallbackEstimate(payload);
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
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(payload) },
        ],
      }),
    });

    if (!response.ok) {
      return buildFallbackEstimate(payload);
    }

    const responsePayload = await response.json();
    const content = responsePayload?.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      return buildFallbackEstimate(payload);
    }

    const parsed = parseEstimate(content);

    if (parsed === null) {
      return buildFallbackEstimate(payload);
    }

    return normalizeEstimate(parsed) ?? buildFallbackEstimate(payload);
  } catch {
    return buildFallbackEstimate(payload);
  }
}
