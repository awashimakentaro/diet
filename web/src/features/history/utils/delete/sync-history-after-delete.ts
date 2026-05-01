/* 【責務】
 * History 削除後に一覧と集計を再同期する。
 */

type SyncHistoryAfterDeleteParams = {
  selectedDateKey: string;
  recomputeDailySummaryForDateKey: (dateKey: string) => Promise<void>;
  mutateDailySummary: () => Promise<unknown>;
  mutateMeals: () => Promise<unknown>;
};

export async function syncHistoryAfterDelete({
  selectedDateKey,
  recomputeDailySummaryForDateKey,
  mutateDailySummary,
  mutateMeals,
}: SyncHistoryAfterDeleteParams): Promise<void> {
  await recomputeDailySummaryForDateKey(selectedDateKey);
  await mutateDailySummary();
  await mutateMeals();
}
