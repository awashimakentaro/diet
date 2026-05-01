/* 【責務】
 * Foods 画面の操作 feedback 文言を生成する。
 */

import type { WebLibraryEntry } from '@/domain/web-diet-schema';

export function buildFoodUpdateSuccessFeedback(): string {
  return '食品カードを更新しました。';
}

export function buildFoodDeleteSuccessFeedback(): string {
  return '食品カードを削除しました。';
}

export function buildFoodReuseSuccessFeedback(entry: Pick<WebLibraryEntry, 'name'>): string {
  return `「${entry.name}」を履歴へ追加しました。`;
}

export function buildFoodUpdateErrorFeedback(error: unknown): string {
  return error instanceof Error ? error.message : '食品カードを更新できませんでした。';
}

export function buildFoodDeleteErrorFeedback(error: unknown): string {
  return error instanceof Error ? error.message : '食品カードを削除できませんでした。';
}

export function buildFoodReuseErrorFeedback(error: unknown): string {
  return error instanceof Error ? error.message : '履歴へ追加できませんでした。';
}
