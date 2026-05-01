/* 【責務】
 * History 保存 utility の振る舞いを検証する。
 */

import { describe, expect, it } from 'vitest';

import type { WebMeal } from '@/domain/web-diet-schema';

import { buildHistorySaveMealErrorFeedback } from '../build-history-save-meal-error-feedback';
import { buildHistorySaveMealSuccessFeedback } from '../build-history-save-meal-success-feedback';
import { canSaveHistoryMeal } from '../can-save-history-meal';
import { findHistoryMealById } from '../find-history-meal-by-id';

const meal: WebMeal = {
  id: 'meal-1',
  recordedAt: '2026-04-22T00:00:00.000Z',
  menuName: '朝食',
  originalText: '卵',
  source: 'manual',
  totals: { kcal: 80, protein: 6, fat: 5, carbs: 0 },
  items: [
    { id: 'item-1', name: '卵', amount: '1個', kcal: 80, protein: 6, fat: 5, carbs: 0 },
  ],
};

describe('history save utils', () => {
  it('保存可否を判定する', () => {
    expect(canSaveHistoryMeal({ mealId: 'meal-1', savedMealIds: [] })).toBe(true);
    expect(canSaveHistoryMeal({ mealId: 'meal-1', savedMealIds: ['meal-1'] })).toBe(false);
  });

  it('meal ID で履歴を取得する', () => {
    expect(findHistoryMealById({ mealId: 'meal-1', meals: [meal] })).toBe(meal);
    expect(findHistoryMealById({ mealId: 'meal-2', meals: [meal] })).toBeNull();
  });

  it('feedback を生成する', () => {
    expect(buildHistorySaveMealSuccessFeedback()).toEqual({
      message: null,
      tone: 'info',
    });
    expect(buildHistorySaveMealErrorFeedback(new Error('保存失敗'))).toEqual({
      message: '保存失敗',
      tone: 'error',
    });
  });
});
