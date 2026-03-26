/**
 * web/src/app/api/record/analyze/route.ts
 *
 * 【責務】
 * Record 画面から送られた prompt を解析し、下書きカード用レスポンスを返す。
 *
 * 【使用されるエージェント / 処理フロー】
 * - request-record-analysis.ts から POST で呼ばれる。
 * - openai-record-analysis.ts を利用して解析結果を生成する。
 *
 * 【やらないこと】
 * - UI 描画
 * - フォーム state 更新
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - record-analysis-schema.ts の入出力検証に依存する。
 * - openai-record-analysis.ts へ解析実処理を委譲する。
 */

import { NextResponse } from 'next/server';

import { recordAnalysisRequestSchema } from '@/features/record/record-analysis-schema';
import { analyzeRecordPrompt } from '@/lib/openai-record-analysis';

/**
 * Record 用 prompt を解析する。
 * 呼び出し元: Web クライアント。
 * @param request POST リクエスト
 * @returns 解析済み JSON レスポンス
 * @remarks 副作用: OpenAI または fallback 解析を実行する。
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const payload = await request.json();
    const parsed = recordAnalysisRequestSchema.parse(payload);
    const draft = await analyzeRecordPrompt(parsed.prompt);

    return NextResponse.json(draft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '解析リクエストの処理に失敗しました。';

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}
