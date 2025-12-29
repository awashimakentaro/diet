# 02_analyze_agent.task.md

## 1. 目的と責務
- テキスト or 画像入力を解析し、`Meal` に準ずる Draft JSON を返す。
- SaveMealAgent や RecordScreen が前提とするフィールド（items, macro 値）をすべて埋めた状態で提供する。
- DB 保存や UI 編集は決して行わない。

## 2. インターフェース
### 2.1 入力
```ts
export type AnalyzeRequest =
  | { type: 'text'; prompt: string; locale: 'ja-JP'; timezone: string }
  | { type: 'image'; uri: string; locale: 'ja-JP'; timezone: string };
```
- `prompt`: ユーザー入力をそのまま渡す。RecordScreen でプリフィル不要。
- `uri`: Expo Image Picker のローカル URI。実装では Base64 変換後 API へ送信。

### 2.2 出力（ドラフト）
```ts
export interface AnalyzeDraft {
  draftId: string; // uuid
  menuName: string; // 仮のタイトル
  originalText: string; // 入力テキスト。画像の場合は AI に要約させる
  items: FoodItem[]; // schema 参照
  totals: Macro; // items から計算した値
  source: 'text' | 'image';
  warnings: string[]; // 推測度合いなどを UI に表示
}
```
- `items` は 1 以上。栄養値が不明な場合、推定値と理由を `warnings` に追加。

## 3. 処理フロー
1. RecordScreen から `AnalyzeRequest` を受け取る。
2. プロンプトテンプレートを生成：
   - schema/例示 JSON を添付。
   - 「出力は JSON のみ」「和食・洋食いずれも推測」「数値を整数 or 小数 1 桁」等を明記。
3. OpenAI など外部 API を呼び出し、JSON 文字列を取得。
4. JSON Schema でバリデーションし、失敗時は `warnings` に理由を入れて空 items 返却。
5. 解析成功時は totals を再計算し、`totals` がズレる場合は矯正する。
6. 結果を RecordScreen の `drafts` state へ返す。

## 4. エラーハンドリング
- ネットワーク失敗：`warnings: ['解析に失敗しました。再実行してください。']` を返し、items を空にする。
- JSON パース失敗：`warnings` に生のレスポンスをマスクして記録。
- 画像解析対象が空：RecordScreen 側で送信禁止だが、念のためエラーを返す。

## 5. 関連ファイル / 依存
- `tasks/01_schema.task.md`（FoodItem, Macro 定義）
- `RecordScreen`：draft を受け取り編集 UI に展開
- `SaveMealAgent`：draft -> Meal 永続化

## 6. 完了条件
- AnalyzeAgent の TypeScript API （関数 or クラス）が決定し、モック実装でも JSON Draft を返せる。
- 将来 API キーを入れ替えても RecordScreen 側の契約変更が不要。
