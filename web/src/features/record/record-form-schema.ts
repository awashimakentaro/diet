/**
 * web/src/features/record/record-form-schema.ts
 *
 * 【責務】
 * Record 画面で使うフォームスキーマを Zod で定義する。
 *
 * 【使用箇所】
 * - web/src/features/record/use-record-form.ts
 *
 * 【やらないこと】
 * - フォーム状態管理
 * - UI 描画
 * - API 通信
 *
 * 【他ファイルとの関係】
 * - RHF の resolver から利用され、入力検証境界になる。
 */

import { z } from 'zod';

export const recordFormSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, '入力内容を設定してください。'),
});

export type RecordFormValues = z.infer<typeof recordFormSchema>;
