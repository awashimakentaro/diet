/* 【責務】
 * Record 画面で使う本日の日付キーを返す。
 */

import { getTodayKey } from '@/lib/web-date';

export function getTodayDateKey(): string {
  return getTodayKey();
}
