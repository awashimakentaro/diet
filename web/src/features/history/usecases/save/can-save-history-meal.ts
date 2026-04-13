/* 【責務】
 * History の食事を食品タブへ保存できるか判定する。
 */

type CanSaveHistoryMealParams = {
  mealId: string;
  savedMealIds: string[];
};

export function canSaveHistoryMeal({
  mealId,
  savedMealIds,
}: CanSaveHistoryMealParams): boolean {
  return !savedMealIds.includes(mealId);
}
