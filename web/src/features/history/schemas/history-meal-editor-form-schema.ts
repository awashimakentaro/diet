/* 【責務】
 * History 編集パネルで使うフォーム項目の型を定義する。
 */

export type HistoryMealEditorFormValues = {
  mealName: string;
  prompt: string;
  items: Array<{
    name: string;
    amount: string;
    kcal: string;
    protein: string;
    fat: string;
    carbs: string;
  }>;
};
