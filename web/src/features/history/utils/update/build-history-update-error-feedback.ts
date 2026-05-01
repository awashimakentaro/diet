/* 【責務】
 * History の更新失敗時に表示するフィードバック内容を決定する。
 */

export function buildHistoryUpdateErrorFeedback(error: unknown): {
  message: string;
  tone: 'error';
} {
  return {
    message:
      error instanceof Error
        ? error.message
        : '履歴を更新できませんでした。',
    tone: 'error',
  };
}
