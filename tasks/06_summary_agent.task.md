# 06_summary_agent.task.md

## 1. 目的と責務
- 指定日の `Meal` から kcal / P / F / C の合計と目標との差分を算出し、RecordScreen / SettingsScreen に提供する。
- 履歴データのみを真実とし、キャッシュは任意。

## 2. 提供機能
| 関数 | 説明 |
| --- | --- |
| `getDailySummary(date: string): Promise<{ totals: Macro; diff: Macro; meals: Meal[] }>` | 指定日の集計。`diff = totals - goal` |
| `subscribe(listener: () => void): () => void` | Meal 変更時の再計算通知 |
| `invalidate(date: string): void` | Save/Update/Delete 後に再集計を要求 |

## 3. 計算ロジック
1. HistoryAgent から `listMealsByDate(date)` を取得。
2. `totals` を reducer（kcal, protein, fat, carbs）で加算。
3. GoalAgent から当日有効な `Goal` を取得。
4. `diff` を `goal - totals` ではなく「過不足」を表す `totals - goal` とし、プラス = 超過, マイナス = 不足で統一。
5. グラフ用に `ratio = totals / goal`（0〜2 でクリップ）を計算（RecordScreen で使用）。

## 4. エラーケース
- Goal 未設定：`goal = {kcal:0,...}` として diff=totals。RecordScreen で「目標未設定」を表示可能。
- Meal 0 件：`totals` は全 0、diff も 0。

## 5. パフォーマンス
- 1 日あたりの Meal 件数は多くても数十件。メモリ再計算で十分。
- 将来的にキャッシュする場合は `Map<string, Summary>` を内部に持ち、invalidate で削除。

## 6. 関連タスク
- `03_save_meal_agent` / `04_history_agent`: invalidate を呼び出す。
- `07_goal_agent`: Goal 更新時に invalidate する。
- `10_record_screen`: サマリー表示。

## 7. 完了条件
- SummaryAgent を呼び出すだけで RecordScreen の「今日の合計」とバー表示が再現できる。
