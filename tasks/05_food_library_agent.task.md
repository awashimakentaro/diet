# 05_food_library_agent.task.md

## 1. 目的と責務
- よく使う食品/メニューを保存・編集・削除し、「今日食べた」操作で RecordScreen へ即座に反映する。
- `Meal` とは独立だが、`FoodItem` 構造を共有して再利用しやすくする。

## 2. 提供機能
| 関数 | 説明 |
| --- | --- |
| `listEntries(filter?: { keyword?: string; type?: 'single' | 'menu' }): Promise<FoodLibraryEntry[]>` | キーワード/タイプで絞り込み。更新日時降順で返却 |
| `createEntry(payload: { label: string; type: 'single' | 'menu'; items: FoodItem[]; defaultMenuName?: string; tags?: string[] }): Promise<FoodLibraryEntry>` | 新規追加 |
| `updateEntry(id: string, updates: Partial<CreatePayload>): Promise<FoodLibraryEntry>` | 既存を編集 |
| `deleteEntry(id: string): Promise<void>` | 物理削除 |
| `toMealDraft(id: string): Promise<AnalyzeDraft>` | RecordScreen へ貼り付ける Draft を生成 |

メニュー保存時は `label` と `defaultMenuName` を分けることで、ライブラリ表示名と履歴 menu_name を独立させる。

## 3. ビジネスルール
- `items` の栄養値はユーザー編集での自由度を優先。`kcal` などが未入力の場合は 0 で保存し、RecordScreen で編集させる。
- 「今日食べた」ボタンは `toMealDraft` → RecordScreen の Draft リストに追加 → SaveMealAgent を通して保存。
- ライブラリから保存した Meal の `source` は `'library'` に統一。

## 4. バリデーション
- `label` は 1〜40 文字。
- `items.length >= 1`。
- `type='single'` の場合 `items.length` は 1 に強制する。

## 5. 検索 / タグ
- `keyword` は `label` と `tags` を対象に部分一致。
- `tags` はユーザー任意の短い文字列（例: 朝食, たんぱく質）。

## 6. 関連タスク
- `01_schema`: FoodLibraryEntry 定義
- `10_record_screen`: Draft へ貼り付け
- `12_foods_screen`: UI 実装

## 7. 完了条件
- ライブラリ API が揃い、FoodsScreen から CRUD、RecordScreen から Draft へのコピーがシンプルに実装できる。
