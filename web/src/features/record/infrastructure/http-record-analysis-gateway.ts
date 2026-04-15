/* 【責務】
 * Record 解析 API を HTTP 経由で呼び出す。
 */

import { fetchValidatedJson } from '@/lib/client-api';

import type { RecordAnalysisGateway } from '../gateways/record-analysis-gateway';
import { recordAnalysisResponseSchema } from '../schemas/record-analysis-schema';

export const httpRecordAnalysisGateway: RecordAnalysisGateway = {
  async requestAnalysis(payload) {
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
  },
};
