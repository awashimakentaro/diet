/**
 * lib/mappers.ts
 *
 * 【責務】
 * Supabase の行データをドメインオブジェクトへ変換する。
 *
 * 【使用箇所】
 * - agents ディレクトリのデータアクセス層
 *
 * 【やらないこと】
 * - ネットワーク呼び出し
 * - UI 管理
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の型を返却する。
 */

import { FoodItem, FoodLibraryEntry, Goal, Macro, Meal, NotificationSetting } from '@/constants/schema';

export type MealRow = {
  id: string;
  user_id: string;
  original_text: string;
  foods: FoodItem[];
  total: Macro;
  timestamp: string;
  menu_name: string;
  source?: string | null;
};

export type FoodRow = {
  id: string;
  user_id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  created_at: string;
  items: FoodItem[];
};

export type GoalRow = {
  user_id: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  updated_at: string;
};

export type NotificationPreferenceRow = {
  user_id: string;
  notify_at_midnight: boolean;
  push_token: string | null;
  updated_at: string;
};

/**
 * MealRow を Meal へ変換する。
 * @param row Supabase 行
 * @returns Meal
 */
export function mapMealRow(row: MealRow): Meal {
  return {
    id: row.id,
    recordedAt: row.timestamp,
    menuName: row.menu_name,
    originalText: row.original_text,
    items: row.foods ?? [],
    totals: row.total ?? { kcal: 0, protein: 0, fat: 0, carbs: 0 },
    source: (row.source as Meal['source']) ?? 'manual',
  };
}

/**
 * FoodRow を FoodLibraryEntry へ変換する。
 * @param row Supabase 行
 */
export function mapFoodRow(row: FoodRow): FoodLibraryEntry {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    calories: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    fat: Number(row.fat) || 0,
    carbs: Number(row.carbs) || 0,
    items: row.items ?? [],
    createdAt: row.created_at,
  };
}

/**
 * GoalRow を Goal へ変換する。
 * @param row Supabase 行
 */
export function mapGoalRow(row: GoalRow): Goal {
  return {
    id: row.user_id,
    kcal: Number(row.calories) || 0,
    protein: Number(row.protein) || 0,
    fat: Number(row.fat) || 0,
    carbs: Number(row.carbs) || 0,
    source: 'manual',
    updatedAt: row.updated_at,
  };
}

/**
 * 通知設定の行をドメインへ変換する。
 * @param row Supabase 行
 */
export function mapNotificationRow(row: NotificationPreferenceRow): NotificationSetting {
  return {
    enabled: row.notify_at_midnight,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    pushToken: row.push_token ?? undefined,
    lastScheduledAt: row.updated_at,
    times: ['midnight'],
  };
}
