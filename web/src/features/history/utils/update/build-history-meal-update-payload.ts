/* 【責務】
 * History 編集フォーム値を meals 更新 payload へ変換する。
 */

type HistoryEditableItem = {
  name: string;
  amount: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
};

export type HistoryMealUpdatePayloadItem = {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type HistoryMealUpdatePayload = {
  menu_name: string;
  foods: HistoryMealUpdatePayloadItem[];
  total: {
    kcal: number;
    protein: number;
    fat: number;
    carbs: number;
  };
};

type BuildHistoryMealUpdatePayloadParams = {
  mealName: string;
  items: HistoryEditableItem[];
};

function toHistoryNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function createHistoryItemId(index: number): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `history-item-${Date.now()}-${index + 1}`;
}

function buildHistoryItems(items: HistoryEditableItem[]): HistoryMealUpdatePayloadItem[] {
  return items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => ({
      id: createHistoryItemId(index),
      name: item.name.trim(),
      amount: item.amount.trim() || '1人前',
      kcal: toHistoryNumber(item.kcal),
      protein: toHistoryNumber(item.protein),
      fat: toHistoryNumber(item.fat),
      carbs: toHistoryNumber(item.carbs),
    }));
}

function buildHistoryTotals(items: HistoryMealUpdatePayloadItem[]): HistoryMealUpdatePayload['total'] {
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

export function buildHistoryMealUpdatePayload({
  mealName,
  items,
}: BuildHistoryMealUpdatePayloadParams): HistoryMealUpdatePayload {
  const normalizedItems = buildHistoryItems(items);

  if (normalizedItems.length === 0) {
    throw new Error('食品カードを1件以上入力してください。');
  }

  return {
    menu_name: mealName.trim() || normalizedItems[0].name,
    foods: normalizedItems,
    total: buildHistoryTotals(normalizedItems),
  };
}
