/* 【責務】
 * History 編集パネルの解析失敗時フィードバック内容を決定する。
 */

export function buildHistoryAnalysisErrorFeedback(error: unknown): {
  message: string;
  tone: 'error';
} {
  return {
    message:
      error instanceof Error
        ? error.message
        : '食品候補の解析に失敗しました。',
    tone: 'error',
  };
}
