# 12_foods_screen.task.md

## 1. 画面目的
- 保存済みの食品 / メニューを検索・管理し、RecordScreen への再利用（今日食べた）を提供する。

## 2. UI セクション
1. **ヘッダー**
   - 検索ボックス（keyword）。
   - フィルタ Chips（すべて / 単品 / メニュー）。
2. **リスト**
   - `FoodLibraryEntry` をカード表示。
   - 表示内容: `label`, `type`, 更新日時, Tag バッジ, 栄養サマリー。
3. **カードアクション**
   - 「編集」「削除」「今日食べた」「Record で開く」。
4. **新規追加ボタン**
   - FAB からフォームモーダルへ遷移。

## 3. 状態管理
```ts
type FoodsState = {
  keyword: string;
  filter: 'all' | 'single' | 'menu';
  entries: FoodLibraryEntry[];
  isLoading: boolean;
  error?: string;
};
```
- フィルタ変更や検索で `FoodLibraryAgent.listEntries` を再呼び出し。

## 4. 操作フロー
1. **新規追加 / 編集**
   - 共通フォーム：label, type, FoodItem リスト、tags。
   - 保存で `FoodLibraryAgent.create/update`。
2. **削除**
   - 確認ダイアログ後 `deleteEntry`。
3. **今日食べた**
   - `toMealDraft` → RecordScreen の Draft stack へ push（ナビゲーションで戻す）。
4. **Record で開く**
   - Draft を新規タブで開き編集継続。

## 5. UX 要件
- `items` が多い場合は折り畳み可能にする。
- タグで色分けし、検索キーワードに一致した箇所をハイライト。
- Entry が 0 件のときは空状態（「記録から食品を保存できます」）。

## 6. 依存
- `05_food_library_agent`, `03_save_meal_agent`（Draft 経由で RecordScreen へ保存）
- RecordScreen とのナビゲーション連携

## 7. 完了条件
- Foods タブのみでライブラリ管理が完結し、RecordScreen での再利用が 2 タップで行える。
