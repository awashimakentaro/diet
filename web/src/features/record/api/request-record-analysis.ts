/* 【責務】
 * Record 解析 API を HTTP 経由で呼び出す。
 */

import { requestMealAnalysis } from '@/features/shared/meal-analysis/api';

import type { RecordAnalysisGateway } from '../types/record-analysis-gateway';

export const requestRecordAnalysis: RecordAnalysisGateway = {
  async requestAnalysis(payload) {
    return requestMealAnalysis(payload);
  },
};
