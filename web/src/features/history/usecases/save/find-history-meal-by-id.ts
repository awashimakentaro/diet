/* 【責務】
 * History 一覧から指定 ID の食事を取得する。
 */

import type { WebMeal } from '@/domain/web-diet-schema';

type FindHistoryMealByIdParams = {
  mealId: string;
  meals: WebMeal[];
};

export function findHistoryMealById({
  mealId,
  meals,
}: FindHistoryMealByIdParams): WebMeal | null {
  return meals.find((meal) => meal.id === mealId) ?? null;
}
