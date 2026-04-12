/* 【責務】
 * Record 画面のフォーム値を meals テーブル保存用 payload へ変換する。
 * payload は、送信する中身そのものです。たとえば API に何かを送るとき、宛先とかヘッダーとか送りたいデータ本体があり、そのデータ本体がpayloadです
 */

import { parseDateKey } from '@/lib/web-date';

import type { RecordFormValues } from '../../../schemas/record-form-schema';

type BuildRecordSavePayloadParams = {
  userId: string;
  values: Pick<RecordFormValues, 'recordedDate' | 'mealName' | 'items'>;
  originalText: string;
  source: 'text' | 'manual';
};

type RecordMealItem = {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

type RecordMealTotals = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

type RecordMealInsertPayload = {
  user_id: string;
  original_text: string;
  foods: RecordMealItem[];
  total: RecordMealTotals;
  menu_name: string;
  timestamp: string;
  source: 'text' | 'manual';
};

function toRecordNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.round(parsed * 10) / 10 : 0;
}

function createRecordItemId(index: number): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `item-${Date.now()}-${index + 1}`;
}

function buildRecordMealItems(items: RecordFormValues['items']): RecordMealItem[] {
  return items
    .filter((item) => item.name.trim().length > 0)
    .map((item, index) => ({
      id: createRecordItemId(index),
      name: item.name.trim(),
      amount: item.amount.trim() || '1人前',
      kcal: toRecordNumber(item.kcal),
      protein: toRecordNumber(item.protein),
      fat: toRecordNumber(item.fat),
      carbs: toRecordNumber(item.carbs),
    }));
}

function buildRecordMealTotals(items: RecordMealItem[]): RecordMealTotals {
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

export function buildRecordSavePayload({
  userId,
  values,
  originalText,
  source,
}: BuildRecordSavePayloadParams): RecordMealInsertPayload {
  const items = buildRecordMealItems(values.items);

  if (items.length === 0) {
    throw new Error('食品カードを1件以上入力してください。');
  }

  const menuName = values.mealName.trim() || items[0]?.name || '名称未設定';
  const totals = buildRecordMealTotals(items);
  const recordedTimestamp = parseDateKey(values.recordedDate).toISOString();

  return {
    user_id: userId,
    original_text: originalText.trim(),
    foods: items,
    total: totals,
    menu_name: menuName,
    timestamp: recordedTimestamp,
    source,
  };
}
