/**
 * agents/history-agent.ts
 *
 * 【責務】
 * Meal データの日付別取得・更新・削除を担う。
 *
 * 【使用箇所】
 * - HistoryScreen
 * - SummaryAgent（list 用途）
 *
 * 【やらないこと】
 * - UI 状態管理
 * - Draft 生成
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts への読み書き、および SummaryAgent 無効化。
 */

import { FoodItem, Meal, calculateMacroFromItems } from '@/constants/schema';
import { invalidateSummary } from '@/agents/summary-agent';
import { getDietState, setDietState } from '@/lib/diet-store';
import { getDateKeyFromIso, getUtcRangeForDateKey } from '@/lib/date';
import { supabase, requireUserId } from '@/lib/supabase';
import { mapMealRow } from '@/lib/mappers';

export type EditableFields = {
  menuName: string;
  originalText: string;
  items: FoodItem[];
};

/**
 * 指定日の Meal を昇順で返す。
 * 呼び出し元: HistoryScreen, SummaryAgent。
 * @param dateKey `YYYY-MM-DD`
 * @returns Meal 配列
 */
export function listMealsByDate(dateKey: string): Meal[] {
  return getDietState()
    .meals.filter((meal) => getDateKeyFromIso(meal.recordedAt) === dateKey)
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneMeal);
}

/**
 * Supabase から指定日分の Meal を同期する。
 * @param dateKey `YYYY-MM-DD`
 */
export async function syncMealsByDate(dateKey: string): Promise<Meal[]> {
  const userId = await requireUserId();
  const { start, end } = getUtcRangeForDateKey(dateKey);
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', start)
    .lt('timestamp', end)
    .order('timestamp');
  if (error) {
    throw new Error(error.message);
  }
  const meals = (data ?? []).map(mapMealRow);
  setDietState((current) => ({
    ...current,
    meals: mergeMeals(current.meals, meals, dateKey),
  }));
  invalidateSummary();
  return meals;
}

/**
 * Meal を更新し、合計値を再計算する。
 * 呼び出し元: HistoryScreen。
 * @param mealId 編集対象 ID
 * @param updates 上書き内容
 * @returns 更新後の Meal
 */
export async function updateMeal(mealId: string, updates: Partial<EditableFields>): Promise<Meal> {
  const current = getDietState().meals.find((meal) => meal.id === mealId);
  if (!current) {
    throw new Error('Meal が見つかりません');
  }
  const nextItems = updates.items ? updates.items.map((item) => ({ ...item })) : current.items;
  const totals = calculateMacroFromItems(nextItems);
  const payload = {
    menu_name: updates.menuName?.trim() || current.menuName,
    original_text: updates.originalText?.trim() ?? current.originalText,
    foods: nextItems,
    total: totals,
  };
  const { data, error } = await supabase.from('meals').update(payload).eq('id', mealId).select().single();
  if (error || !data) {
    throw new Error(error?.message ?? '更新に失敗しました');
  }
  const updated = mapMealRow(data);
  setDietState((state) => ({
    ...state,
    meals: state.meals.map((meal) => (meal.id === mealId ? updated : meal)),
  }));
  invalidateSummary();
  return cloneMeal(updated);
}

/**
 * Meal を 1 件削除する。
 * 呼び出し元: HistoryScreen。
 * @param mealId 削除対象 ID
 */
export async function deleteMeal(mealId: string): Promise<void> {
  const { error } = await supabase.from('meals').delete().eq('id', mealId);
  if (error) {
    throw new Error(error.message);
  }
  setDietState((current) => ({ ...current, meals: current.meals.filter((meal) => meal.id !== mealId) }));
  invalidateSummary();
}

/**
 * 指定日の Meal をまとめて削除する。
 * 呼び出し元: HistoryScreen。
 * @param dateKey `YYYY-MM-DD`
 */
export async function deleteMealsByDate(dateKey: string): Promise<void> {
  const userId = await requireUserId();
  const { start, end } = getUtcRangeForDateKey(dateKey);
  const { error } = await supabase
    .from('meals')
    .delete()
    .eq('user_id', userId)
    .gte('timestamp', start)
    .lt('timestamp', end);
  if (error) {
    throw new Error(error.message);
  }
  setDietState((current) => ({
    ...current,
    meals: current.meals.filter((meal) => getDateKeyFromIso(meal.recordedAt) !== dateKey),
  }));
  invalidateSummary();
}

/**
 * Meal を ID で取得する。
 * 呼び出し元: FoodsScreen（保存用）。
 * @param mealId 取得対象 ID
 * @returns Meal or undefined
 */
export function getMeal(mealId: string): Meal | undefined {
  const meal = getDietState().meals.find((entry) => entry.id === mealId);
  return meal ? cloneMeal(meal) : undefined;
}

function cloneMeal(meal: Meal): Meal {
  return {
    ...meal,
    items: meal.items.map((item) => ({ ...item })),
    totals: { ...meal.totals },
  };
}

function mergeMeals(existing: Meal[], incoming: Meal[], dateKey: string): Meal[] {
  const filtered = existing.filter((meal) => getDateKeyFromIso(meal.recordedAt) !== dateKey);
  return [...filtered, ...incoming].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}
