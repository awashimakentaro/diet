/* 【責務】
 * History の削除失敗時に表示するフィードバック内容を決定する。
 */

export function buildHistoryDeleteErrorFeedback(error: unknown): {
  message: string;
  tone: 'error';
} {
  return {
    message:
      error instanceof Error
        ? error.message//true
        : '履歴を削除できませんでした。',//false
    tone: 'error',
  };
}
