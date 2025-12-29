# 03_save_meal_agent.task.md

## 1. 目的と責務
- AnalyzeAgent または Foods ライブラリから渡された Draft を `Meal` に正規化し、履歴へ保存する。
- 保存完了後に SummaryAgent と HistoryAgent へ更新通知を出す。
- UI リセットやトースト表示は RecordScreen 側で行う。

## 2. インターフェース
```ts
export interface SaveMealRequest {
  draft: AnalyzeDraft; // or Library entry converted to draft
  overrides?: Partial<{
    menuName: string;
    originalText: string;
    items: FoodItem[];
  }>;
}

export interface SaveMealResponse {
  meal: Meal;
}
```
- `overrides` は UI 編集結果。`draft` をベースに上書きする。

## 3. 処理手順
1. `draft + overrides` から `Meal` を構築。
   - `menuName`/`originalText` を trim。
   - `items` の Macro を再計算し `totals` を生成。
   - `source` は `draft.source` を引き継ぐ。ライブラリ経由の場合は `'library'`。
2. `recordedAt` を `new Date().toISOString()` で付与。RecordScreen で日付指定はなし。
3. ストレージへ `Meal` を append。
   - AsyncStorage: `meals` キーの配列を読みだし → push → write。
   - SQLite: INSERT 文。
4. 保存成功後、以下を emit:
   - `onMealSaved(meal)` イベント → SummaryAgent がリッスン。
   - `RecordScreen` へ成功レスポンス。エラー時は例外を投げる。

## 4. バリデーション
- `items.length === 0` → 保存拒否。
- `totals` が NaN の場合は 0 に補正。
- 重複 ID を避けるため `uuid` は保存時に必ず再生成。

## 5. エラーハンドリング
- ストレージ書き込み失敗：例外をそのまま RecordScreen へ伝播、UI 側でトースト表示。
- Draft 不整合（必須フィールド欠落）：`Error('Invalid draft')` を投げ、RecordScreen で再解析を促す。

## 6. 関連タスク
- `02_analyze_agent`（Draft 供給元）
- `04_history_agent`（保存結果の取得・編集）
- `06_summary_agent`（集計更新）

## 7. 完了条件
- SaveMealAgent を呼び出すだけで履歴へ確実に保存され、RecordScreen が最新サマリーを描画できる。
- 単体テスト：Draft から Meal 生成 / バリデーション失敗ケース。
