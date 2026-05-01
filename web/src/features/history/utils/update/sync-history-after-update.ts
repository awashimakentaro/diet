/* 【責務】
 * History 更新後に一覧と集計を再同期する。
 */

type SyncHistoryAfterUpdateParams = {
  selectedDateKey: string;
  recomputeDailySummaryForDateKey: (dateKey: string) => Promise<void>;
  mutateDailySummary: () => Promise<unknown>;
  mutateMeals: () => Promise<unknown>;
};

export async function syncHistoryAfterUpdate({
  selectedDateKey,
  recomputeDailySummaryForDateKey,
  mutateDailySummary,
  mutateMeals,
}: SyncHistoryAfterUpdateParams): Promise<void> {
  await recomputeDailySummaryForDateKey(selectedDateKey);
  await mutateDailySummary();
  await mutateMeals();
}
