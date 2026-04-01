/**
 * web/src/features/record/api/request-record-analysis.ts
 *
 * 【責務】
 * Record 画面から AI 解析 API を呼び出し、検証済みレスポンスを返す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-record-screen.ts や history の編集 UI から呼ばれる。
 * - `/api/record/analyze` に prompt を送信し、解析結果を受け取る。
 *
 * 【やらないこと】
 * - UI 描画
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - record-analysis-schema.ts と client-api.ts を利用する。
 */

import { fetchValidatedJson } from '@/lib/client-api';

import {
  recordAnalysisResponseSchema,
  type RecordAnalysisRequest,
  type RecordAnalysisResponse,
} from '../record-analysis-schema';

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
