/* 【責務】
 * History 編集パネルから AI 解析 API を呼び出し、検証済みレスポンスを返す。
 */

import type {
  RecordAnalysisRequest,
  RecordAnalysisResponse,
} from '@/features/record/schemas/record-analysis-schema';
import { requestRecordAnalysis } from '@/features/record/api/request-record-analysis';

export async function requestHistoryMealAnalysis(
  payload: RecordAnalysisRequest,
): Promise<RecordAnalysisResponse> {
  return requestRecordAnalysis(payload);
}
