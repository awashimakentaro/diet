/* 【責務】
 * History 編集パネルで解析結果が空だった場合のフィードバック内容を決定する。
 */

export function buildHistoryAnalysisEmptyFeedback(): {
  message: string;
  tone: 'error';
} {
  return {
    message: '食品候補を追加できませんでした。',
    tone: 'error',
  };
}
