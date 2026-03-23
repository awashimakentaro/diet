/**
 * web/src/lib/web-formatters.ts
 *
 * 【責務】
 * Web 版 UI で使う表示用フォーマット処理を提供する。
 *
 * 【使用箇所】
 * - web/app 配下の各ページ
 * - web/src/components/web-summary-panel.tsx
 *
 * 【やらないこと】
 * - 日付の保存
 * - データ取得
 * - UI 状態管理
 *
 * 【他ファイルとの関係】
 * - web/src/data/mock-diet-data.ts の値を、人が読める文字列へ変換する。
 */

/**
 * kcal 値を表示用文字列へ変換する。
 * 呼び出し元: 各ページの数値表示。
 * @param value 表示対象の kcal 数値
 * @returns `kcal` 付きの文字列
 * @remarks 副作用は存在しない。
 */
export function formatKcal(value: number): string {
  return `${Math.round(value)} kcal`;
}

/**
 * g 単位の栄養値を表示用文字列へ変換する。
 * 呼び出し元: サマリーパネル、履歴、食品一覧。
 * @param value 表示対象の栄養値
 * @returns `g` 付きの文字列
 * @remarks 副作用は存在しない。
 */
export function formatGram(value: number): string {
  return `${Math.round(value)} g`;
}

/**
 * 差分値を `+` / `-` 付き文字列へ変換する。
 * 呼び出し元: web-summary-panel.tsx。
 * @param value 目標との差分
 * @returns 符号付き文字列
 * @remarks 副作用は存在しない。
 */
export function formatSignedValue(value: number): string {
  if (value === 0) {
    return '±0';
  }

  if (value > 0) {
    return `+${Math.round(value)}`;
  }

  return `${Math.round(value)}`;
}

/**
 * ISO 日時文字列から `M月D日` 形式を生成する。
 * 呼び出し元: 履歴ページ、ホーム画面。
 * @param value ISO 形式の日時文字列
 * @returns 日付ラベル
 * @remarks 副作用は存在しない。
 */
export function formatDateLabel(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ja-JP', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * ISO 日時文字列から `HH:mm` 形式を生成する。
 * 呼び出し元: 履歴ページ、ホーム画面。
 * @param value ISO 形式の日時文字列
 * @returns 時刻ラベル
 * @remarks 副作用は存在しない。
 */
export function formatTimeLabel(value: string): string {
  const date = new Date(value);
  return new Intl.DateTimeFormat('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
