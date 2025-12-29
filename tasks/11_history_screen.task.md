# 11_history_screen.task.md

## 1. 画面目的
- 日付ごとの Meal 履歴を一覧し、編集・削除・一括削除・食品保存を提供する。

## 2. UI セクション
1. **日付ナビゲーション**
   - 今日基準で `prev / next` ボタン。
   - カレンダー式ポップアップ（任意）。
2. **サマリーサブヘッダー**
   - 選択日の totals を簡易表示（SummaryAgent 再利用）。
3. **Meal カード一覧**
   - menuName, originalText, recordedAt（時刻）, totals。
   - FoodItem のミニリスト。
4. **アクションバー**
   - 「編集」「削除」「食品に保存」「複製して今日に追加」。
5. **一括削除**
   - 画面下部に「この日の記録をすべて削除」ボタン（確認ダイアログ付き）。

## 3. 状態管理
```ts
type HistoryState = {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  isLoading: boolean;
  error?: string;
};
```
- 日付変更時に `HistoryAgent.listMealsByDate(date)` を fetch。
- `SummaryAgent` の subscribe で totals を更新。

## 4. 操作フロー
1. **編集**
   - Meal 編集画面（モーダル）で menuName / originalText / items を編集。
   - 保存で `HistoryAgent.updateMeal`。
2. **削除**
   - 単体: `HistoryAgent.deleteMeal` → SummaryAgent invalidate。
3. **食品に保存**
   - 選択 Meal の items を `FoodLibraryAgent.createEntry` へ渡す。
4. **複製して今日に追加**
   - Meal を Draft に変換して RecordScreen へ遷移（`toMealDraft`）。
5. **一括削除**
   - 確認後 `HistoryAgent.deleteMealsByDate(date)`。

## 5. バリデーション / UX
- 日付の未来側には「記録なし」プレースホルダを表示。
- 一括削除は確認ダイアログ必須（取り消し不可のため）。
- 編集 UI でも items の totals を即時計算して表示。

## 6. 依存
- `04_history_agent`, `06_summary_agent`, `05_food_library_agent`（保存）
- RecordScreen との連携（複製）

## 7. 完了条件
- 履歴タブで必要な CRUD とライブラリ連携が全て完結し、RecordScreen とデータ整合する。
