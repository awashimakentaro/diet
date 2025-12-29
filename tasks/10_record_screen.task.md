# 10_record_screen.task.md

## 1. 画面目的
- 今日のサマリーを表示しつつ、テキスト or 画像入力から Meal Draft を生成・編集・保存する。
- サマリー → 入力 → 編集 → 保存のループを 1 画面内で完了させる。

## 2. UI セクション
1. **サマリーカード**
   - `SummaryAgent.getDailySummary(today)` の totals/diff/ratio をバーで表示。
   - 目標未設定時は「目標を設定してください」リンクを表示し SettingsScreen へ遷移。
2. **入力ボックス**
   - テキスト multiline + 「送信」ボタン。
   - カメラボタン（画像選択 → AnalyzeAgent）。
   - 送信後はローディングインジケータを表示。
3. **Draft リスト**
   - `AnalyzeDraft` をカード表示。menuName / items / warnings。
   - 各カードで食品の追加/削除/編集ができる（FoodItem Editor）。
   - 「保存」ボタンで SaveMealAgent を呼ぶ。
4. **Foods ショートカット**
   - 「ライブラリから追加」ボタン → FoodLibrary モーダル → Draft に追加。

## 3. 状態設計
```ts
type RecordState = {
  summary: Summary;
  drafts: AnalyzeDraft[];
  inputText: string;
  isAnalyzing: boolean;
  lastError?: string;
};
```
- 送信後に `drafts` へ push。保存成功で対象ドラフトを削除。
- Draft が 0 件になったら入力ボックスへスクロールしてフォーカス。

## 4. フロー
1. 画面表示時
   - `SummaryAgent.getDailySummary(today)` を fetch。
   - `SummaryAgent.subscribe` で更新を監視。
2. テキスト送信
   - `AnalyzeAgent` 呼び出し。
   - 成功: Draft 追加。失敗: warning 表示。
3. 画像送信
   - Expo Image Picker → uri → `AnalyzeAgent`。
4. 食品編集
   - FoodItem 行で数量/栄養値入力を行い totals を再計算。
5. 保存
   - Draft ID をキーに `SaveMealAgent` へリクエスト。
   - 成功: Draft 削除、SummaryAgent が自動更新。
   - 失敗: toast + Draft 残す。

## 5. バリデーション / UX
- Draft 内で必須値が空の場合は保存ボタンを disabled。
- items 編集時に `kcal` 等が空なら 0 を入れる。
- warnings がある Draft には黄色バッジを表示し、ユーザーが確認できるようにする。

## 6. 依存関係
- `02_analyze_agent`, `03_save_meal_agent`, `05_food_library_agent`, `06_summary_agent`。
- ナビゲーション: SettingsScreen / FoodsScreen へのリンク。

## 7. 完了条件
- 記録タブで 1 日のワークフロー（入力→解析→編集→保存→サマリー更新）がノンストップで行える。
