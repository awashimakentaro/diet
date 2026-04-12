/* 【責務】
 * History 編集パネルの解析成功時フィードバック内容を決定する。
 */

type BuildHistoryAnalysisFeedbackParams = {
  warning: string | null;
  itemCount: number;
};

export function buildHistoryAnalysisFeedback({
  warning,
  itemCount,
}: BuildHistoryAnalysisFeedbackParams): { message: string; tone: 'info' | 'error' } {
  if (warning) {
    return {
      message: warning,
      tone: 'error',
    };
  }

  return {
    message: `${itemCount}件の食品候補を追加しました。`,
    tone: 'info',
  };
}
