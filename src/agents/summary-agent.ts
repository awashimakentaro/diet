/**
 * agents/summary-agent.ts
 *
 * 【責務】
 * 日付単位の栄養サマリーを算出し、変更通知とキャッシュ無効化の仕組みを提供する。
 *
 * 【使用箇所】
 * - RecordScreen / HistoryScreen の合計表示
 * - NotificationAgent のメッセージ生成
 *
 * 【やらないこと】
 * - Meal の保存や削除
 * - UI レンダリング
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts から Meals / Goal 情報を読み取る。
 */

import { Macro, Meal, Goal } from '@/constants/schema';
import { getDietState } from '@/lib/diet-store';
import { getDateKeyFromIso } from '@/lib/date';

export type DailySummary = {
  date: string;
  totals: Macro;
  goal: Macro;
  diff: Macro;
  ratio: Macro;
  meals: Meal[];
};

const summaryListeners = new Set<() => void>();

/**
 * 指定日のサマリーを計算する。
 * 呼び出し元: RecordScreen, SettingsScreen, NotificationAgent。
 * @param dateKey `YYYY-MM-DD` の日付キー
 * @returns DailySummary
 * @remarks 副作用は存在しない。
 */
export function getDailySummary(dateKey: string): DailySummary {
  const { meals, goal } = getDietState();
  const mealsForDate = meals.filter((meal) => getDateKeyFromIso(meal.recordedAt) === dateKey);
  const totals = mealsForDate.reduce<Macro>(
    (acc, meal) => ({
      kcal: acc.kcal + meal.totals.kcal,
      protein: acc.protein + meal.totals.protein,
      fat: acc.fat + meal.totals.fat,
      carbs: acc.carbs + meal.totals.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
  return {
    date: dateKey,
    totals,
    goal: goal,
    diff: diffMacro(totals, goal),
    ratio: ratioMacro(totals, goal),
    meals: mealsForDate,
  };
}

/**
 * SummaryAgent の購読を設定する。
 * 呼び出し元: hooks/use-daily-summary。
 * @param listener サマリーが無効化された際に呼ばれる関数
 * @returns 購読解除関数
 */
export function subscribeSummary(listener: () => void): () => void {
  summaryListeners.add(listener);
  return () => summaryListeners.delete(listener);
}

/**
 * サマリーの再計算を要求し、購読者へ通知する。
 * 呼び出し元: SaveMealAgent, HistoryAgent, GoalAgent。
 */
export function invalidateSummary(): void {
  summaryListeners.forEach((listener) => listener());
}

/**
 * Macro の差分を計算する。
 * 呼び出し元: getDailySummary。
 * @param totals 実績値
 * @param goal 目標値
 * @returns totals - goal
 */
function diffMacro(totals: Macro, goal: Goal): Macro {
  return {
    kcal: totals.kcal - goal.kcal,
    protein: totals.protein - goal.protein,
    fat: totals.fat - goal.fat,
    carbs: totals.carbs - goal.carbs,
  };
}

/**
 * Macro の達成率 (0-2) を算出する。
 * 呼び出し元: getDailySummary。
 * @param totals 実績
 * @param goal 目標
 * @returns ratio Macro
 */
function ratioMacro(totals: Macro, goal: Goal): Macro {
  const clamp = (value: number) => Math.min(2, goalValueSafe(value));
  return {
    kcal: clamp(divideSafe(totals.kcal, goal.kcal)),
    protein: clamp(divideSafe(totals.protein, goal.protein)),
    fat: clamp(divideSafe(totals.fat, goal.fat)),
    carbs: clamp(divideSafe(totals.carbs, goal.carbs)),
  };
}

function divideSafe(numerator: number, denominator: number): number {
  if (!denominator) {
    return 0;
  }
  return numerator / denominator;
}

function goalValueSafe(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return value;
}
