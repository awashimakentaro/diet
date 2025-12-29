# 04_history_agent.task.md

## 1. 目的と責務
- `Meal` を日付単位で取得・編集・削除・一括削除する API を提供する。
- UI からの操作を受け、SaveMealAgent 以外の永続化ニーズを一手に担う。
- 食品ライブラリや SummaryAgent が間接的に利用する読み取り専用関数も提供する。

## 2. 提供関数
| 関数 | 呼び出し元 | 説明 |
| --- | --- | --- |
| `listMealsByDate(date: string): Promise<Meal[]>` | HistoryScreen / SummaryAgent | `date` は `YYYY-MM-DD` ローカル日付。`recordedAt` をタイムゾーン変換してフィルタ |
| `updateMeal(mealId: string, updates: Partial<EditableFields>): Promise<Meal>` | HistoryScreen | menu_name, original_text, items の編集。`totals` は再計算 |
| `deleteMeal(mealId: string): Promise<void>` | HistoryScreen | 単体削除（物理）|
| `deleteMealsByDate(date: string): Promise<void>` | HistoryScreen | 当日分をすべて削除 |
| `getMeal(mealId: string): Promise<Meal | undefined>` | FoodsScreen（保存時参照） | 単一取得 |

`EditableFields = { menuName: string; originalText: string; items: FoodItem[] }`

## 3. 処理ルール
- すべての更新後に `totals` を再計算し、SummaryAgent へ通知する。
- 削除後も再集計通知を必ず送る。通知方法は EventEmitter or Zustand store などで実装可能。
- 一括削除は配列フィルタリングで実現し、削除件数 0 の場合でも成功扱い。

## 4. 検索 / 並び順
- `listMealsByDate` の返却順は `recordedAt` 昇順。UI が時系列で並ぶことを保証。
- 将来のページングを想定しても構造が変わらないよう、戻り値は配列 + `totalCount` 等を含むラッパーを検討（v1 は配列のみでも可）。

## 5. バリデーション
- `updates.items` が空 → `Error('Meal must contain at least one item')`。
- `updates` 未指定で `updateMeal` が呼ばれた場合は no-op。
- `menuName` は trim 後 1 文字以上。

## 6. エラーハンドリング
- 対象 meal が見つからない場合は `NotFoundError` を投げる。
- 一括削除でストレージ書き込みが失敗した場合はロールバック不要（全削除なので書き込みに失敗したら例外で終了）。

## 7. 関連タスク
- `03_save_meal_agent`: 保存済みデータを編集/削除する。
- `06_summary_agent`: list/update/delete でサマリー再計算を要求する。
- `10_record_screen`: 保存後に `listMealsByDate` を再利用して差分取得できる。

## 8. 完了条件
- HistoryAgent のユニットテストで CRUD シナリオが網羅され、日付フィルタが仕様通り動作する。
- UI 側は HistoryAgent を通じてのみ履歴を操作し、直接ストレージへアクセスしない。
