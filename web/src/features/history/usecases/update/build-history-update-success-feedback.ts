/* 【責務】
 * History の更新成功時に表示するフィードバック内容を決定する。
 */

export function buildHistoryUpdateSuccessFeedback(): {
  message: string;
  tone: 'info';
} {
  return {
    message: '履歴を更新しました。',
    tone: 'info',
  };
}
