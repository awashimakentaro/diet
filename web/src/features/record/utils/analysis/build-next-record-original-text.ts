/* 【責務】
 * Record の解析結果適用後に保持する元入力テキストを決定する。
 */

type BuildNextRecordOriginalTextParams = {
  currentOriginalText: string;
  prompt: string;
  analysisMode: 'append' | 'replace';
};

export function buildNextRecordOriginalText({
  currentOriginalText,
  prompt,
  analysisMode,
}: BuildNextRecordOriginalTextParams): string {
  const trimmedPrompt = prompt.trim();

  if (analysisMode === 'append' && currentOriginalText.trim().length > 0) {
    return trimmedPrompt.length > 0
      ? `${currentOriginalText}\n${trimmedPrompt}`
      : currentOriginalText;
  }

  return trimmedPrompt;
}
