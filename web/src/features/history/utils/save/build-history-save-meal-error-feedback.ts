/* 【責務】
 * History の食事を食品タブへ保存できなかった場合のフィードバック内容を決定する。
 */

export function buildHistorySaveMealErrorFeedback(error: unknown): {
  message: string;
  tone: 'error';
} {
  return {
    message:
      error instanceof Error
        ? error.message
        : '食品タブへの保存に失敗しました。',
    tone: 'error',
  };
}
