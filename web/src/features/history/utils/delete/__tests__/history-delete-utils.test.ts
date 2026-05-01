/* 【責務】
 * History 削除 utility の振る舞いを検証する。
 */

import { describe, expect, it, vi } from 'vitest';

import { buildHistoryDeleteErrorFeedback } from '../build-history-delete-error-feedback';
import { buildHistoryDeleteSuccessFeedback } from '../build-history-delete-success-feedback';
import { syncHistoryAfterDelete } from '../sync-history-after-delete';

describe('history delete utils', () => {
  it('feedback を生成する', () => {
    expect(buildHistoryDeleteSuccessFeedback()).toEqual({
      message: '履歴から削除しました。',
      tone: 'info',
    });
    expect(buildHistoryDeleteErrorFeedback(new Error('削除失敗'))).toEqual({
      message: '削除失敗',
      tone: 'error',
    });
  });

  it('削除後に集計と一覧を同期する', async () => {
    const recomputeDailySummaryForDateKey = vi.fn().mockResolvedValue(undefined);
    const mutateDailySummary = vi.fn().mockResolvedValue(undefined);
    const mutateMeals = vi.fn().mockResolvedValue(undefined);

    await syncHistoryAfterDelete({
      selectedDateKey: '2026-04-22',
      recomputeDailySummaryForDateKey,
      mutateDailySummary,
      mutateMeals,
    });

    expect(recomputeDailySummaryForDateKey).toHaveBeenCalledWith('2026-04-22');
    expect(mutateDailySummary).toHaveBeenCalledOnce();
    expect(mutateMeals).toHaveBeenCalledOnce();
  });
});
