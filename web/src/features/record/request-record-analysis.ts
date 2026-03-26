/**
 * web/src/features/record/request-record-analysis.ts
 *
 * 【責務】
 * Record 画面から AI 解析 API を呼び出し、検証済みレスポンスを返す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - use-record-screen.ts から呼ばれる。
 * - `/api/record/analyze` に prompt を送信し、解析結果を受け取る。
 *
 * 【やらないこと】
 * - UI 描画
 * - フォーム state 更新
 * - OpenAI への直接アクセス
 *
 * 【他ファイルとの関係】
 * - record-analysis-schema.ts と client-api.ts を利用する。
 */

import { fetchValidatedJson } from '@/lib/client-api';

import {
  recordAnalysisResponseSchema,
  type RecordAnalysisRequest,
  type RecordAnalysisResponse,
} from './record-analysis-schema';

/**
 * prompt を送信して解析結果を取得する。
 * 呼び出し元: use-record-screen。
 * @param payload 解析対象の prompt
 * @returns 検証済み解析レスポンス
 * @remarks 副作用: ネットワーク I/O を発生させる。
 */
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
