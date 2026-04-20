<!-- 【責務】
 今後の実装・整備の優先順位を整理する。
-->

# roadmap.md

## 目的
- 今後の作業を実行順に整理する
- リファクタ、テスト、Playwright、CI の順序を固定する
- その時々の思いつきで順番を崩さないための基準にする

## 基本方針
- 先に構造を安定させる
- 次に壊れやすい箇所へ単体テストを入れる
- その後に重要導線の E2E を入れる
- 最後に CI へ載せて自動化する

## 優先順位

### 1. 構造整理
- feature と shared の責務境界を固定する
- `record` に残すものと shared に置くものの基準を明確にする
- `server` に置く処理の基準を明確にする
- 薄い wrapper は原則作らない

### 2. 型の安定化
- `npm run check-types` を常に通す
- shared の公開 API を型で固定する
- feature 外から触ってよい入口を絞る

### 3. 単体テスト
- `record/utils/analysis`
- `record/utils/save`
- `shared/meal-editor`
- `shared/meal-analysis`
- 保存・解析・状態遷移の壊れやすい箇所を優先する

### 4. コンポーネントテスト
- `record-screen`
- editor 系 UI
- shared 化した add panel 周辺
- 振る舞いが複雑な UI に絞る

### 5. Playwright
- まず重要導線だけ作る
- ログイン
- record で入力
- 保存
- history で反映確認
- foods の再利用または編集

### 6. CI
- 最初は軽く始める
- `check-types`
- unit test
- 必要なら lint
- Playwright は後から追加する

## 直近でやること
- shared 化後の責務境界を見直して固定する
- `record` と shared 周辺の unit test を増やす
- `record -> save -> history` の Playwright を 1 本作る
- `check-types` と unit test を CI に載せる

## 後回しでよいこと
- すべての画面に対する Playwright
- 重い CI ジョブの追加
- 見た目だけの細かい整理
- ドキュメントの細かい言い換え

## 順序を崩してはいけない理由
- 構造が不安定なまま E2E を増やすと、修正のたびにテストが大量に壊れる
- 単体テストなしで CI を厚くすると、失敗原因の切り分けが難しくなる
- 先に重要導線だけ固める方が、開発速度と保守性の両立がしやすい
