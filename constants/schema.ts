/**
 * constants/schema.ts
 *
 * 【責務】
 * Diet アプリ全体で共有するドメインスキーマとヘルパー関数を定義する。
 *
 * 【使用箇所】
 * - agents ディレクトリ配下の各エージェント
 * - UI コンポーネントおよびスクリーン
 *
 * 【やらないこと】
 * - 永続化や状態管理ロジック
 * - API 呼び出し
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts から import され、状態の型安全性を担保する。
 */

export type Macro = {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
};

export type FoodCategory = 'dish' | 'ingredient' | 'unknown';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  amount: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type MealSource = 'text' | 'image' | 'manual' | 'library';

export interface Meal {
  id: string;
  recordedAt: string;
  menuName: string;
  originalText: string;
  items: FoodItem[];
  totals: Macro;
  source: MealSource;
  notes?: string;
}

export interface FoodLibraryEntry {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  items: FoodItem[];
  createdAt: string;
}

export interface ProfileSnapshot {
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetWeeks: number;
  activityLevel: 'low' | 'moderate' | 'high';
}

export interface Profile {
  id: string;
  gender: 'male' | 'female' | 'other';
  birthDate: string;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  targetDate: string;
  activityLevel: 'low' | 'moderate' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
  source: 'manual' | 'auto';
  calculatedFromProfile?: ProfileSnapshot;
  updatedAt: string;
}

export type NotificationTime = 'morning' | 'noon' | 'evening' | 'midnight';

export interface NotificationSetting {
  enabled: boolean;
  lastScheduledAt?: string;
  timezone: string;
  pushToken?: string;
  times: NotificationTime[];
}

export type AnalyzeRequest =
  | { type: 'text'; prompt: string; locale: string; timezone: string }
  | { type: 'image'; uri: string; base64?: string | null; locale: string; timezone: string };

export interface AnalyzeDraft {
  draftId: string;
  menuName: string;
  originalText: string;
  items: FoodItem[];
  totals: Macro;
  source: Extract<MealSource, 'text' | 'image' | 'library' | 'manual'>;
  warnings: string[];
}

/**
 * FoodItem 配列から Macro 合計を算出する。
 * 呼び出し元: SaveMealAgent, HistoryAgent, RecordScreen。
 * @param items 合算対象の食品配列
 * @returns items の栄養値合計
 * @remarks 副作用は存在しない。
 */
export function calculateMacroFromItems(items: FoodItem[]): Macro {
  return items.reduce<Macro>(
    (acc, item) => ({
      kcal: acc.kcal + normalizeMacroValue(item.kcal),
      protein: acc.protein + normalizeMacroValue(item.protein),
      fat: acc.fat + normalizeMacroValue(item.fat),
      carbs: acc.carbs + normalizeMacroValue(item.carbs),
    }),
    { kcal: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

/**
 * Macro の各値を 0 以上の小数 1 桁に整形する。
 * 呼び出し元: calculateMacroFromItems, SaveMealAgent。
 * @param value 元の数値
 * @returns 0 以上に丸め込んだ値
 * @remarks 副作用は存在しない。
 */
export function normalizeMacroValue(value: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  const nonNegative = Math.max(0, safe);
  return Math.round(nonNegative * 10) / 10;
}

/**
 * Meal を Draft 表現へ変換し、RecordScreen で再編集できるようにする。
 * 呼び出し元: HistoryScreen（複製機能）、FoodLibraryAgent。
 * @param meal 変換元の Meal
 * @returns RecordScreen へ渡せる AnalyzeDraft
 * @remarks 副作用は存在しない。
 */
export function convertMealToDraft(meal: Meal): AnalyzeDraft {
  return {
    draftId: `${meal.id}-draft`,
    menuName: meal.menuName,
    originalText: meal.originalText,
    items: meal.items.map((item) => ({ ...item })),
    totals: { ...meal.totals },
    source: meal.source,
    warnings: [],
  };
}
