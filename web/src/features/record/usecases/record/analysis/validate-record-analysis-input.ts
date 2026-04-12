/* 【責務】
 * Record 解析入力が有効か判定する。
 */

type ValidateRecordAnalysisInputParams = {
  prompt: string;
  hasAttachments: boolean;
};

type ValidateRecordAnalysisInputResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateRecordAnalysisInput({
  prompt,
  hasAttachments,
}: ValidateRecordAnalysisInputParams): ValidateRecordAnalysisInputResult {
  if (prompt.trim().length === 0 && !hasAttachments) {
    return {
      ok: false,
      message: '食事内容または写真を追加すると、下の編集欄へ下書きを反映できます。',
    };
  }

  return { ok: true };
}
