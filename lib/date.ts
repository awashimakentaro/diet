/**
 * lib/date.ts
 *
 * 【責務】
 * Meal の日付計算や表示用フォーマット処理を担当するユーティリティをまとめる。
 *
 * 【使用箇所】
 * - HistoryAgent / SummaryAgent のフィルタリング
 * - 各スクリーンの日付表示
 *
 * 【やらないこと】
 * - UI レンダリング
 * - タイムゾーン設定の永続化
 *
 * 【他ファイルとの関係】
 * - constants/schema.ts の `recordedAt` を扱う補助関数群。
 */

const pad = (value: number) => `${value}`.padStart(2, '0');

/**
 * Date をローカルタイムゾーンの `YYYY-MM-DD` に変換する。
 * 呼び出し元: HistoryAgent.listMealsByDate, SummaryAgent。
 * @param date 変換対象の Date
 * @returns ローカル日付キー
 * @remarks 副作用は存在しない。
 */
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * ISO8601 文字列を受け取り、ローカル日付キーへ正規化する。
 * 呼び出し元: HistoryAgent, SummaryAgent。
 * @param iso ISO8601 の日時文字列
 * @returns ローカル `YYYY-MM-DD`
 * @remarks 副作用は存在しない。
 */
export function getDateKeyFromIso(iso: string): string {
  return formatDateKey(new Date(iso));
}

/**
 * ローカル日付キーを Date に変換する。
 * 呼び出し元: HistoryScreen の prev/next 操作。
 * @param key `YYYY-MM-DD` 形式の文字列
 * @returns Date オブジェクト
 * @remarks 副作用は存在しない。
 */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map((value) => Number.parseInt(value, 10));
  return new Date(year, month - 1, day);
}

/**
 * ローカル日付キーを基準に日数を加減算する。
 * 呼び出し元: HistoryScreen。
 * @param key 基準となる日付キー
 * @param offsetDays 加算/減算する日数（マイナス値可）
 * @returns 計算後の日付キー
 * @remarks 副作用は存在しない。
 */
export function shiftDateKey(key: string, offsetDays: number): string {
  const date = parseDateKey(key);
  date.setDate(date.getDate() + offsetDays);
  return formatDateKey(date);
}

/**
 * 日付キーに対応するローカル日の UTC 範囲を返す。
 * @param key `YYYY-MM-DD`
 * @returns UTC ISO 文字列の start/end
 */
export function getUtcRangeForDateKey(key: string): { start: string; end: string } {
  const startDate = parseDateKey(key);
  const endDate = parseDateKey(key);
  endDate.setDate(endDate.getDate() + 1);
  return { start: startDate.toISOString(), end: endDate.toISOString() };
}

/**
 * 現在日時のローカル日付キーを返す。
 * 呼び出し元: RecordScreen, SummaryAgent。
 * @returns 今日の `YYYY-MM-DD`
 * @remarks 副作用は存在しない。
 */
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

/**
 * Date を `HH:mm` 形式で表示する。
 * 呼び出し元: HistoryScreen のカード表示。
 * @param date 表示対象の Date
 * @returns `HH:mm` 文字列
 * @remarks 副作用は存在しない。
 */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
