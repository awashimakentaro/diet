/* 【責務】
 * History 編集パネルから AI 解析 API を呼び出し、検証済みレスポンスを返す。
 */

import type {
  MealAnalysisRequest,
  MealAnalysisResponse,
} from '@/features/shared/meal-analysis/schemas';
import { requestMealAnalysis } from '@/features/shared/meal-analysis/api';

export async function requestHistoryMealAnalysis(
  payload: MealAnalysisRequest,
): Promise<MealAnalysisResponse> {
  return requestMealAnalysis(payload);
}
