/**
 * web/src/features/history/map-web-meal-row.ts
 *
 * 【責務】
 * Supabase の meals 行を History 画面で使う WebMeal へ変換する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - list-history-meals.ts から呼ばれる。
 * - Supabase 応答を UI 表示用の型へ正規化する。
 *
 * 【やらないこと】
 * - API 通信
 * - UI 描画
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - web-diet-schema.ts の WebMeal 型へ変換する。
 */

import type { WebMeal, WebMealSource } from '@/domain/web-diet-schema';

type WebMealRow = {
  id: string;
  original_text: string;
  foods: Array<{
    id?: string;
    name?: string;
    amount?: string;
    kcal?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  }> | null;
  total: {
    kcal?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  } | null;
  timestamp: string;
  menu_name: string;
  source?: string | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSource(value: string | null | undefined): WebMealSource {
  if (value === 'image' || value === 'manual' || value === 'library') {
    return value;
  }

  return 'text';
}

export function mapWebMealRow(row: WebMealRow): WebMeal {
  const items = (row.foods ?? []).map((item, index) => ({
    id: item.id ?? `${row.id}-item-${index + 1}`,
    name: item.name ?? '名称未設定',
    amount: item.amount ?? '-',
    kcal: toNumber(item.kcal),
    protein: toNumber(item.protein),
    fat: toNumber(item.fat),
    carbs: toNumber(item.carbs),
  }));

  return {
    id: row.id,
    recordedAt: row.timestamp,
    menuName: row.menu_name,
    originalText: row.original_text,
    source: toSource(row.source),
    totals: {
      kcal: toNumber(row.total?.kcal),
      protein: toNumber(row.total?.protein),
      fat: toNumber(row.total?.fat),
      carbs: toNumber(row.total?.carbs),
    },
    items,
  };
}
