/**
 * web/src/features/history/update-history-meal.ts
 *
 * 【責務】
 * History 画面の編集内容を meals テーブルへ更新保存する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-history-screen.ts から呼ばれる。
 * - 編集フォーム値を Supabase 更新 payload に変換して保存する。
 *
 * 【やらないこと】
 * - UI 描画
 * - フォーム状態管理
 * - ルート遷移
 *
 * 【他ファイルとの関係】
 * - getSupabaseBrowserClient を利用して認証ユーザーの meals を更新する。
 */

import { getSupabaseBrowserClient } from '@/lib/supabase';

type HistoryEditableItem = {
  name: string;
  amount: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

type UpdateHistoryMealParams = {
  mealId: string;
  mealName: string;
  items: HistoryEditableItem[];
};

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function buildItems(items: HistoryEditableItem[]) {
  return items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => ({
      id: `history-item-${Date.now()}-${index + 1}`,
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

export async function updateHistoryMeal({
  mealId,
  mealName,
  items,
}: UpdateHistoryMealParams): Promise<void> {
  const client = getSupabaseBrowserClient();
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const userId = userData.user?.id;

  if (!userId) {
    throw new Error('ログイン状態を確認できません。');
  }

  const normalizedItems = buildItems(items);

  if (normalizedItems.length === 0) {
    throw new Error('食品カードを1件以上入力してください。');
  }

  const normalizedMealName = mealName.trim() || normalizedItems[0].name;
  const totals = buildTotals(normalizedItems);
  const { error } = await client
    .from('meals')
    .update({
      menu_name: normalizedMealName,
      foods: normalizedItems,
      total: totals,
    })
    .eq('id', mealId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
