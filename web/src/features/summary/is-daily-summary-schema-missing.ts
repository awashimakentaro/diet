/**
 * web/src/features/summary/is-daily-summary-schema-missing.ts
 *
 * 【責務】
 * daily_summaries 未適用環境の Supabase エラーを判定する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - summary 系の取得・再計算処理から呼ばれる。
 * - テーブル未作成時にアプリ全体を壊さないための分岐に使う。
 *
 * 【やらないこと】
 * - API 通信
 * - UI 描画
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - list/recompute 系ファイルから利用される。
 */

export function isDailySummarySchemaMissing(message: string): boolean {
  return message.includes('daily_summaries')
    || message.includes("Could not find the 'kcal' column")
    || message.includes("Could not find the 'date' column");
}
