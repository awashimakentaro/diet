/**
 * agents/save-meal-agent.ts
 *
 * 【責務】
 * Draft を Meal に正規化して状態へ保存し、サマリーを再計算させる。
 *
 * 【使用箇所】
 * - RecordScreen の保存ボタン
 *
 * 【やらないこと】
 * - Draft 生成
 * - UI の状態管理
 *
 * 【他ファイルとの関係】
 * - lib/diet-store.ts へ書き込み、SummaryAgent に invalidate を通知する。
 */

import { AnalyzeDraft, FoodItem, Meal, calculateMacroFromItems } from '@/constants/schema';
import { invalidateSummary } from '@/agents/summary-agent';
import { setDietState } from '@/lib/diet-store';
import { supabase, requireUserId } from '@/lib/supabase';
import { mapMealRow } from '@/lib/mappers';
import { syncMealsByDate } from '@/agents/history-agent';
import { getDateKeyFromIso } from '@/lib/date';

export type SaveMealRequest = {
  draft: AnalyzeDraft;
  overrides?: Partial<Pick<Meal, 'menuName' | 'originalText' | 'items'>>;
};

export type SaveMealResponse = {
  meal: Meal;
};

/**
 * Draft を保存し、状態を更新する。
 * 呼び出し元: RecordScreen。
 * @param request 保存対象 Draft と上書き内容
 * @returns 保存済み Meal
 */
export async function saveMeal(request: SaveMealRequest): Promise<SaveMealResponse> {
  const meal = buildMealFromDraft(request);
  if (meal.items.length === 0) {
    throw new Error('食品カードを 1 件以上追加してください。');
  }
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('meals')
    .insert({
      user_id: userId,
      original_text: meal.originalText,
      foods: meal.items,
      total: meal.totals,
      timestamp: meal.recordedAt,
      menu_name: meal.menuName,
    })
    .select()
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? 'Meal を保存できませんでした');
  }
  const saved = mapMealRow(data);
  setDietState((current) => ({ ...current, meals: [...current.meals, saved] }));
  invalidateSummary();
  syncMealsByDate(getDateKeyFromIso(saved.recordedAt)).catch(() => undefined);
  return { meal: saved };
}

/**
 * Draft から Meal を組み立てる。
 * 呼び出し元: saveMeal。
 * @param request Draft + overrides
 * @returns Meal
 */
function buildMealFromDraft(request: SaveMealRequest): Meal {
  const mergedItems = (request.overrides?.items ?? request.draft.items).map((item) => ({ ...item }));
  return {
    id: `temp-${request.draft.draftId}`,
    recordedAt: new Date().toISOString(),
    menuName: (request.overrides?.menuName ?? request.draft.menuName).trim() || '名称未設定',
    originalText: (request.overrides?.originalText ?? request.draft.originalText).trim(),
    items: mergedItems,
    totals: calculateMacroFromItems(mergedItems),
    source: request.draft.source,
  };
}
