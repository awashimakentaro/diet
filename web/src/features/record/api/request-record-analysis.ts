/* 【責務】
 * Record 画面から AI 解析 API を呼び出し、検証済みレスポンスを返す。
 */

import { fetchValidatedJson } from '@/lib/client-api';

import {
  recordAnalysisResponseSchema,
  type RecordAnalysisRequest,
  type RecordAnalysisResponse,
} from '../schemas/record-analysis-schema';

export async function requestRecordAnalysis(
  payload: RecordAnalysisRequest,
): Promise<RecordAnalysisResponse> {
  return fetchValidatedJson(
    '/api/record/analyze',
    recordAnalysisResponseSchema,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}
