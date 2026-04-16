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
import * as Sentry from '@sentry/nextjs';

import { recordAnalysisRequestSchema } from '@/features/record/schemas/record-analysis-schema';
import { ensureServerSentryInitialized } from '@/lib/monitoring/ensure-sentry-server';
import { serverLogger } from '@/lib/monitoring/server-logger';
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
    serverLogger.info({
      event: 'record_analyze_started',
      promptLength: parsed.prompt.trim().length,
      imageCount: parsed.images?.length ?? 0,
    });
    const draft = await analyzeRecordPrompt(parsed.prompt, parsed.images);
    serverLogger.info({
      event: 'record_analyze_succeeded',
      itemCount: draft.items.length,
      warningCount: draft.warnings.length,
      source: draft.source,
    });

    return NextResponse.json(draft);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '解析リクエストの処理に失敗しました。';
    ensureServerSentryInitialized();
    serverLogger.error({
      event: 'record_analyze_failed',
      message,
      error,
    });
    Sentry.withScope((scope) => {
      scope.setTag('feature', 'record');
      scope.setTag('operation', 'analyze');
      scope.setExtra('message', message);
      Sentry.captureException(error);
    });
    await Sentry.flush(2000);

    return NextResponse.json(
      { message },
      { status: 400 },
    );
  }
}
