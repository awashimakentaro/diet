/* 【責務】
 * Record の保存成功時に表示するフィードバック内容を決定する。
 */

export function buildRecordSaveSuccessFeedback(): {
  message: string;
  tone: 'info';
} {
  return {
    message: '履歴に保存しました。',
    tone: 'info',
  };
}
