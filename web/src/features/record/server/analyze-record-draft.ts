/* 【責務】
 * Record の解析下書きをサーバー側で生成する。
 */

import { analyzeRecordPrompt } from '@/lib/openai-record-analysis';

export async function analyzeRecordDraft(
  prompt: string,
  images?: string[],
) {
  return analyzeRecordPrompt(prompt, images);
}
