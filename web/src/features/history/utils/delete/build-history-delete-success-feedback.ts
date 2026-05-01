/* 【責務】
 * History の削除成功時に表示するフィードバック内容を決定する。
 */

export function buildHistoryDeleteSuccessFeedback(): {
  message: string;
  tone: 'info';
} {
  return {
    message: '履歴から削除しました。',
    tone: 'info',
  };
}
