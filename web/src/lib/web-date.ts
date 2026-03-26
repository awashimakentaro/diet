/**
 * web/src/lib/web-date.ts
 *
 * 【責務】
 * Web 版で日付キーと UTC 範囲を扱う補助関数を提供する。
 *
 * 【使用されるエージェント / 処理フロー】
 * - history 系データ取得処理から呼ばれる。
 * - ローカル日付キーを Supabase 問い合わせ用の UTC 範囲へ変換する。
 *
 * 【やらないこと】
 * - UI 描画
 * - データ取得
 * - 永続化
 *
 * 【他ファイルとの関係】
 * - history の一覧取得処理から利用される。
 */

function pad(value: number): string {
  return `${value}`.padStart(2, '0');
}

export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map((value) => Number.parseInt(value, 10));
  return new Date(year, month - 1, day);
}

export function getUtcRangeForDateKey(key: string): { start: string; end: string } {
  const startDate = parseDateKey(key);
  const endDate = parseDateKey(key);
  endDate.setDate(endDate.getDate() + 1);

  return {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}
