/* 【責務】
 * Record 解析の外部境界を定義する。
 */

import type {
  RecordAnalysisRequest,
  RecordAnalysisResponse,
} from '../schemas/record-analysis-schema';

export type RecordAnalysisGateway = {
  requestAnalysis: (
    payload: RecordAnalysisRequest,
  ) => Promise<RecordAnalysisResponse>;
};
