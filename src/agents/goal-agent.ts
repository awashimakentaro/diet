/**
 * agents/goal-agent.ts
 *
 * 【責務】
 * 目標値の取得・更新および体格情報からの自動計算を提供する。
 *
 * 【使用箇所】
 * - SettingsScreen
 * - SummaryAgent（goal 読み取り）
 *
 * 【やらないこと】
 * - Profile の保存
 * - UI 表示
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts で Goal を更新し、SummaryAgent を無効化する。
 */

import { Goal, Macro, ProfileSnapshot } from '@/constants/schema';
import { invalidateSummary } from '@/agents/summary-agent';
import { getDietState, setGoal } from '@/lib/diet-store';
import { supabase, requireUserId } from '@/lib/supabase';
import { mapGoalRow } from '@/lib/mappers';

export type CalculatedGoal = {
  macro: Macro;
  profileSnapshot: ProfileSnapshot;
  method: 'mifflin-st-jeor';
  tdee: number;
};

const goalListeners = new Set<() => void>();

/**
 * 現在の Goal を返す。
 * 呼び出し元: SettingsScreen, SummaryAgent。
 * @returns Goal
 */
export function getGoal(): Goal {
  return { ...getDietState().goal };
}

/**
 * Supabase から Goal を取得する。
 */
export async function fetchGoal(): Promise<Goal> {
  const userId = await requireUserId();
  const { data, error } = await supabase.from('goals').select('*').eq('user_id', userId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  const defaultGoal: Goal = getDietState().goal;
  if (!data) {
    return defaultGoal;
  }
  const goal = mapGoalRow(data);
  setGoal(goal);
  notifyGoalChanged();
  return goal;
}

/**
 * Goal の購読を設定する。
 * 呼び出し元: SettingsScreen。
 * @param listener Goal 変更時に呼ばれる関数
 * @returns 購読解除関数
 */
export function subscribeGoal(listener: () => void): () => void {
  goalListeners.add(listener);
  return () => goalListeners.delete(listener);
}

/**
 * 手動目標を保存する。
 * 呼び出し元: SettingsScreen。
 * @param macro 入力値
 * @returns 保存済み Goal
 */
export async function setManualGoal(macro: Macro): Promise<Goal> {
  const userId = await requireUserId();
  const payload = {
    user_id: userId,
    calories: macro.kcal,
    protein: macro.protein,
    fat: macro.fat,
    carbs: macro.carbs,
  };
  const { data, error } = await supabase.from('goals').upsert(payload).select().single();
  if (error || !data) {
    throw new Error(error?.message ?? '目標を保存できませんでした');
  }
  const goal = mapGoalRow(data);
  setGoal(goal);
  notifyGoalChanged();
  return goal;
}

/**
 * Profile 情報から目標値を計算する。
 * 呼び出し元: SettingsScreen。
 * @param profileSnapshot 年齢などを含む Snapshot
 * @returns 計算結果
 */
export function calculateGoalFromProfile(profileSnapshot: ProfileSnapshot): CalculatedGoal {
  const bmr = calculateBmr(profileSnapshot);
  const activityFactor = getActivityFactor(profileSnapshot.activityLevel);
  const tdee = bmr * activityFactor;
  const adjustment = calculateCalorieAdjustment(profileSnapshot);
  const calories = clampCalories(tdee + adjustment);
  const macro = macroFromCalories(calories);
  return {
    macro,
    profileSnapshot,
    method: 'mifflin-st-jeor',
    tdee,
  };
}

/**
 * 自動計算結果を Goal として保存する。
 * 呼び出し元: SettingsScreen。
 * @param result calculateGoalFromProfile の結果
 * @returns Goal
 */
export async function applyCalculatedGoal(result: CalculatedGoal): Promise<Goal> {
  const userId = await requireUserId();
  const payload = {
    user_id: userId,
    calories: result.macro.kcal,
    protein: result.macro.protein,
    fat: result.macro.fat,
    carbs: result.macro.carbs,
  };
  const { data, error } = await supabase.from('goals').upsert(payload).select().single();
  if (error || !data) {
    throw new Error(error?.message ?? '自動計算値を保存できませんでした');
  }
  const goal = mapGoalRow(data);
  setGoal(goal);
  notifyGoalChanged();
  return goal;
}

function notifyGoalChanged() {
  goalListeners.forEach((listener) => listener());
  invalidateSummary();
}

function calculateBmr(snapshot: ProfileSnapshot): number {
  const base = 10 * snapshot.currentWeightKg + 6.25 * snapshot.heightCm - 5 * snapshot.age;
  if (snapshot.gender === 'male') {
    return base + 5;
  }
  if (snapshot.gender === 'female') {
    return base - 161;
  }
  return base - 78; // 中間値
}

function getActivityFactor(level: ProfileSnapshot['activityLevel']): number {
  if (level === 'high') {
    return 1.55;
  }
  if (level === 'moderate') {
    return 1.375;
  }
  return 1.2;
}

function calculateCalorieAdjustment(snapshot: ProfileSnapshot): number {
  const deltaWeight = snapshot.targetWeightKg - snapshot.currentWeightKg;
  if (!snapshot.targetWeeks || snapshot.targetWeeks <= 0) {
    return 0;
  }
  const weeklyDelta = deltaWeight / snapshot.targetWeeks;
  return (weeklyDelta * 7700) / 7;
}

function clampCalories(calories: number): number {
  return Math.min(4000, Math.max(1200, calories));
}

function macroFromCalories(calories: number): Macro {
  const proteinKcal = calories * 0.25;
  const fatKcal = calories * 0.25;
  const carbKcal = calories * 0.5;
  return {
    kcal: Math.round(calories),
    protein: Math.round(proteinKcal / 4),
    fat: Math.round(fatKcal / 9),
    carbs: Math.round(carbKcal / 4),
  };
}
