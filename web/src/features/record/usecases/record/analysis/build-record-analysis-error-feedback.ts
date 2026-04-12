/* 【責務】
 * Record の解析失敗時に表示するフィードバック内容を決定する。
 */

export function buildRecordAnalysisErrorFeedback(error: unknown): {
  message: string;
  tone: 'error';
} {
  return {
    message:
      error instanceof Error
        ? error.message
        : '解析に失敗したため、簡易的な下書きを表示しています。',
    tone: 'error',
  };
}
