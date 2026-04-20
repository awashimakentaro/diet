/* 【責務】
 * Record 解析の外部境界を定義する。
 */

import type {
  MealAnalysisRequest as RecordAnalysisRequest,
  MealAnalysisResponse as RecordAnalysisResponse,
} from '@/features/shared/meal-analysis/schemas';

export type RecordAnalysisGateway = {
  requestAnalysis: (
    payload: RecordAnalysisRequest,
  ) => Promise<RecordAnalysisResponse>;
};
