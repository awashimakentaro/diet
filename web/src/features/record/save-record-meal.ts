/**
 * web/src/features/record/save-record-meal.ts
 *
 * 【責務】
 * Record 画面の現在フォーム内容を Meal として Supabase へ保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-record-screen.ts から呼ばれる。
 * - form 値を meals テーブルの insert payload へ変換して保存する。
 *
 * 【やらないこと】
 * - UI 描画
 * - 画面遷移
 * - 履歴一覧の再取得
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient と record-form-schema.ts の型を利用する。
 * - prune-old-meals.ts を利用して保持期限外履歴を削除する。
 * - recompute-daily-summary.ts を利用して日次集計を更新する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';
import { parseDateKey } from '@/lib/web-date';

import { pruneOldMealsForCurrentUser } from '../history/prune-old-meals';
import { recomputeDailySummaryForDateKey } from '../summary/recompute-daily-summary';
import type { RecordFormValues } from './record-form-schema';

type SaveRecordMealParams = {
  values: Pick<RecordFormValues, 'recordedDate' | 'mealName' | 'items'>;
  originalText: string;
  source: 'text' | 'manual';
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function createItemId(index: number): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${index + 1}`;
}

function buildMealItems(items: RecordFormValues['items']) {
  return items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => ({
      id: createItemId(index),
      name: item.name.trim(),
      amount: item.amount.trim() || '1人前',
      kcal: toNumber(item.kcal),
      protein: toNumber(item.protein),
      fat: toNumber(item.fat),
      carbs: toNumber(item.carbs),
    }));
}

function buildTotals(items: Array<{ kcal: number; protein: number; fat: number; carbs: number }>) {
  return items.reduce(
    (totals, item) => ({
      kcal: totals.kcal + item.kcal,
      protein: totals.protein + item.protein,
      fat: totals.fat + item.fat,
      carbs: totals.carbs + item.carbs,
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

export async function saveRecordMeal({
  values,
  originalText,
  source,
}: SaveRecordMealParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const items = buildMealItems(values.items);

  if (items.length === 0) {
    throw new Error('食品カードを1件以上入力してください。');
  }

  const menuName = values.mealName.trim() || items[0]?.name || '名称未設定';
  const totals = buildTotals(items);
  const recordedTimestamp = parseDateKey(values.recordedDate).toISOString();
  const payload = {
    user_id: userId,
    original_text: originalText.trim(),
    foods: items,
    total: totals,
    menu_name: menuName,
    timestamp: recordedTimestamp,
    source,
  };

  const { error } = await client.from('meals').insert(payload);

  if (error) {
    const fallbackPayload = {
      user_id: userId,
      original_text: originalText.trim(),
      foods: items,
      total: totals,
      menu_name: menuName,
      timestamp: recordedTimestamp,
    };
    const { error: fallbackError } = await client.from('meals').insert(fallbackPayload);

    if (fallbackError) {
      throw new Error(fallbackError.message);
    }
  }

  try {
    await recomputeDailySummaryForDateKey(values.recordedDate);
  } catch {
    // Summary recompute failure should not block current save.
  }

  try {
    await pruneOldMealsForCurrentUser();
  } catch {
    // Retention cleanup failure should not block current save.
  }
}
