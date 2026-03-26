/**
 * web/src/domain/web-diet-schema.ts
 *
 * 【責務】
 * Web 版で表示する食事管理データの型を定義する。
 *
 * 【使用箇所】
 * - web/src/data/mock-diet-data.ts
 * - web/app 配下の各ページ
 * - web/src/components 配下の表示コンポーネント
 *
 * 【やらないこと】
 * - データ取得
 * - 計算処理
 * - UI 描画
 *
 * 【他ファイルとの関係】
 * - モバイル版の schema.ts を直接共有せず、Web 表示に必要な型境界を独立管理する。
 */

export type WebMacro = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type WebTopFood = {
  name: string;
  count: number;
};

export type WebMealSource = 'text' | 'image' | 'manual' | 'library';

export interface WebFoodItem {
  id: string;
  name: string;
  amount: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface WebMeal {
  id: string;
  recordedAt: string;
  menuName: string;
  originalText: string;
  source: WebMealSource;
  totals: WebMacro;
  items: WebFoodItem[];
}

export interface WebDailySummary {
  date: string;
  totals: WebMacro;
  mealCount: number;
  topFoods: WebTopFood[];
  updatedAt: string;
}

export interface WebLibraryEntry {
  id: string;
  name: string;
  description: string;
  amount: string;
  tags: string[];
  totals: WebMacro;
  items: WebFoodItem[];
}

export interface WebGoal {
  source: 'manual' | 'auto';
  updatedAt: string;
  totals: WebMacro;
}

export interface WebProfileSnapshot {
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetWeeks: number;
  activityLevel: 'low' | 'moderate' | 'high';
}

export interface WebNotificationSetting {
  enabled: boolean;
  time: string;
  timezone: string;
}

export interface WebRecordDraft {
  menuName: string;
  originalText: string;
  source: WebMealSource;
  warnings: string[];
  items: WebFoodItem[];
  totals: WebMacro;
}
