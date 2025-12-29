/**
 * agents/food-library-agent.ts
 *
 * 【責務】
 * 食品ライブラリの CRUD と RecordScreen への Draft 変換を担当する。
 *
 * 【使用箇所】
 * - FoodsScreen
 * - RecordScreen（ライブラリから貼り付け）
 *
 * 【やらないこと】
 * - Meal 保存
 * - UI 制御
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts の foodLibrary を操作する。
 */

import { AnalyzeDraft, FoodItem, FoodLibraryEntry, calculateMacroFromItems } from '@/constants/schema';
import { enqueueDraft, getDietState, setDietState } from '@/lib/diet-store';
import { supabase, requireUserId } from '@/lib/supabase';
import { mapFoodRow } from '@/lib/mappers';
import { createId } from '@/lib/id';

export type CreateEntryPayload = {
  name: string;
  amount: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  items: FoodItem[];
};

export type ListFilter = {
  keyword?: string;
  type?: 'single' | 'menu' | 'all';
};

/**
 * Supabase から食品ライブラリを同期する。
 */
export async function refreshFoodLibrary(): Promise<FoodLibraryEntry[]> {
  const userId = await requireUserId();
  const { data, error } = await supabase.from('foods').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  const entries = (data ?? []).map(mapFoodRow);
  setDietState((current) => ({ ...current, foodLibrary: entries }));
  return entries;
}

/**
 * ライブラリエントリをフィルタして返す。
 * 呼び出し元: FoodsScreen。
 */
export function listEntries(filter?: ListFilter): FoodLibraryEntry[] {
  const keyword = filter?.keyword?.toLowerCase();
  const type = filter?.type && filter.type !== 'all' ? filter.type : undefined;
  return getDietState()
    .foodLibrary.filter((entry) => {
      const keywordMatch = keyword ? entry.name.toLowerCase().includes(keyword) : true;
      const typeMatch = type ? deriveType(entry) === type : true;
      return keywordMatch && typeMatch;
    })
    .map(cloneEntry);
}

/**
 * ライブラリへ新規追加する。
 */
export async function createEntry(payload: CreateEntryPayload): Promise<FoodLibraryEntry> {
  const userId = await requireUserId();
  const normalizedItems = normalizeItems(payload.items, payload.items.length > 1 ? 'menu' : 'single');
  const { data, error } = await supabase
    .from('foods')
    .insert({
      user_id: userId,
      name: payload.name.trim(),
      amount: payload.amount.trim(),
      calories: payload.calories,
      protein: payload.protein,
      fat: payload.fat,
      carbs: payload.carbs,
      items: normalizedItems,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? '食品を保存できませんでした');
  }
  const entry = mapFoodRow(data);
  setDietState((current) => ({ ...current, foodLibrary: [entry, ...current.foodLibrary] }));
  return cloneEntry(entry);
}

/**
 * 既存エントリを更新する。
 */
export async function updateEntry(id: string, updates: Partial<CreateEntryPayload>): Promise<FoodLibraryEntry> {
  const normalizedItems = updates.items
    ? normalizeItems(updates.items, updates.items.length > 1 ? 'menu' : 'single')
    : undefined;
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.amount !== undefined) payload.amount = updates.amount.trim();
  if (updates.calories !== undefined) payload.calories = updates.calories;
  if (updates.protein !== undefined) payload.protein = updates.protein;
  if (updates.fat !== undefined) payload.fat = updates.fat;
  if (updates.carbs !== undefined) payload.carbs = updates.carbs;
  if (normalizedItems) payload.items = normalizedItems;
  const { data, error } = await supabase.from('foods').update(payload).eq('id', id).select().single();
  if (error || !data) {
    throw new Error(error?.message ?? '更新に失敗しました');
  }
  const entry = mapFoodRow(data);
  setDietState((current) => ({
    ...current,
    foodLibrary: current.foodLibrary.map((value) => (value.id === id ? entry : value)),
  }));
  return cloneEntry(entry);
}

/**
 * エントリを削除する。
 */
export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('foods').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
  setDietState((current) => ({ ...current, foodLibrary: current.foodLibrary.filter((entry) => entry.id !== id) }));
}

/**
 * エントリを Draft として RecordScreen へ転送する。
 */
export function toMealDraft(id: string): AnalyzeDraft {
  const entry = getEntryById(id);
  const draft = buildDraftFromEntry(entry);
  enqueueDraft(draft);
  return draft;
}

/**
 * ライブラリエントリから Draft を生成する（キューには積まない）。
 * @param id 対象エントリ ID
 */
export function createDraftFromEntry(id: string): AnalyzeDraft {
  const entry = getEntryById(id);
  return buildDraftFromEntry(entry);
}

function getEntryById(id: string): FoodLibraryEntry {
  const entry = getDietState().foodLibrary.find((value) => value.id === id);
  if (!entry) {
    throw new Error('エントリが見つかりません');
  }
  return entry;
}

function buildDraftFromEntry(entry: FoodLibraryEntry): AnalyzeDraft {
  const items = entry.items.length > 0 ? entry.items : [createBlankItem(entry)];
  return {
    draftId: createId('draft'),
    menuName: entry.name,
    originalText: entry.name,
    items: items.map((item) => ({ ...item })),
    totals: calculateMacroFromItems(items),
    source: 'library',
    warnings: [],
  };
}

function normalizeItems(items: FoodItem[], type: 'single' | 'menu'): FoodItem[] {
  const normalized = items.length > 0 ? items : [createBlankItem()];
  if (type === 'single') {
    return [normalized[0]];
  }
  return normalized;
}

function createBlankItem(entry?: FoodLibraryEntry): FoodItem {
  return {
    id: createId('item'),
    name: entry?.name ?? '新しい食品',
    category: 'unknown',
    amount: entry?.amount ?? '1人前',
    kcal: entry?.calories ?? 0,
    protein: entry?.protein ?? 0,
    fat: entry?.fat ?? 0,
    carbs: entry?.carbs ?? 0,
  };
}

function cloneEntry(entry: FoodLibraryEntry): FoodLibraryEntry {
  return {
    ...entry,
    items: entry.items.map((item) => ({ ...item })),
  };
}

function deriveType(entry: FoodLibraryEntry): 'single' | 'menu' {
  return entry.items.length > 1 ? 'menu' : 'single';
}
