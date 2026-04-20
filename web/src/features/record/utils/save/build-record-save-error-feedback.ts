/* 【責務】
 * Record の保存失敗時に表示するフィードバック内容を決定する。
 */

export function buildRecordSaveErrorFeedback(error: unknown): {
  message: string;
  tone: 'error';
} {
  return {
    message:
      error instanceof Error
        ? error.message
        : '履歴へ保存できませんでした。',
    tone: 'error',
  };
}
