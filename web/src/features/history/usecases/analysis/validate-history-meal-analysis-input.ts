/* 【責務】
 * History 編集パネルの解析入力が有効か判定する。
 */

type ValidateHistoryMealAnalysisInputParams = {
  prompt: string;
};

type ValidateHistoryMealAnalysisInputResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateHistoryMealAnalysisInput({
  prompt,
}: ValidateHistoryMealAnalysisInputParams): ValidateHistoryMealAnalysisInputResult {
  if (prompt.trim().length === 0) {
    return {
      ok: false,
      message: '追加したい食品を入力してください。',
    };
  }

  return { ok: true };
}
