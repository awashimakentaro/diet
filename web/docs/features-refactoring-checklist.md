<!-- 【責務】
 features 配下のリファクタリング手順をチェック表として管理する。
-->

# features-refactoring-checklist.md

## 目的
- `web/src/features/record` の構造を理想形として、他 feature の整理順を固定する
- SRP に反する巨大 hook / 巨大 component / feature 間依存を段階的に減らす
- 実装中の思いつきで責務境界を崩さない

## 理想形

`features/record` を基準にする。

- `components/`: 画面部品を責務単位で分ける
- `hooks/`: 画面状態、フォーム状態、副作用の単位で分ける
- `utils/`: 純粋関数を用途別ディレクトリに分ける
- `api/`: UI や hook から呼ぶ通信・永続化の入口を置く
- `server/`: DB、認証、外部サービスなどサーバー側で実行する処理を置く
- `schemas/` または `types/`: feature 内の入力値・依存インターフェースを固定する
- `usecases/`: 複数処理を束ねる必要が出た場合だけ置く。基本は `utils/`、`api/`、`server/` を優先する
- `__tests__` または `__test__`: 壊れやすい純粋関数と状態遷移を優先して置く

### フォルダ形式
- `hooks/use-x/index.ts` と `hooks/use-x/use-x.ts` の形に揃える
- `utils/x/index.ts` と `utils/x/x.ts` の形に揃える
- `components/x/index.ts` と `components/x/x.tsx` の形に揃える
- feature 内の呼び出し元は、原則として各ディレクトリの `index.ts` から import する
- `hooks/` 直下に置くファイルは `index.ts` のみにする
- `utils/` 直下に置くファイルは原則禁止し、責務ごとのディレクトリへ入れる
- `components/` 直下に置くファイルは画面本体など最上位の組み立てに限る

## 判断基準

- 1ファイルに複数の状態群がある場合は hook を分ける
- 1 component がフォーム、一覧、操作パネル、ローディング表示を同時に持つ場合は component を分ける
- `record` の component を他 feature が直接 import している場合は shared へ移す
- Alert 文言、成功状態、失敗状態の組み立てはまず `utils/` に逃がす
- DB、認証、外部サービスを触る処理は `server/` に寄せる
- テスト観点が複数ある関数は分割対象にする

## 全体チェック

- [x] 既存の `features/record` 構造を基準形として確定する
- [x] feature 外から触ってよい公開口を `index.ts` で絞る
- [x] `hooks/use-x/index.ts` と `hooks/use-x/use-x.ts` の形に揃える
- [x] `utils/x/index.ts` と `utils/x/x.ts` の形に揃える
- [x] `components/x/index.ts` と `components/x/x.tsx` の形に揃える
- [x] `record` 専用ではない editor / analysis / attachment 部品を shared に置く
- [x] feature 間の相互 import をなくす
- [x] 巨大 hook を状態単位・操作単位に分ける
- [x] 巨大 component を表示責務単位に分ける
- [x] 純粋関数へ切り出した箇所に単体テストを置く
- [x] `npm run check-types` を通す
- [x] 重要導線だけコンポーネントテストまたは E2E を追加する

## 1. Foods

最優先。`record` の次に整理する feature。

### 目的
- 食品ライブラリの一覧、編集、AI 追加、保存処理を分ける
- `record` component への直接依存をなくす
- `record` の editor 構造に近づける

### チェック表
- [x] `use-foods-screen.ts` の責務を棚卸しする
- [x] 一覧取得・検索・フィルターを `hooks/use-food-library-list` に分ける
- [x] 編集フォーム状態を `hooks/use-food-entry-editor` に分ける
- [x] AI 追加と画像添付を shared または `hooks/use-food-entry-analysis` に分ける
- [x] 保存・削除・今日食べた登録の feedback 組み立てを `utils/` に分ける
- [x] DB、認証、外部サービスを触る処理を `server/` に分ける
- [x] `food-entry-editor-panel.tsx` を editor 内の小 component に分ける
- [x] `record` 由来の共通 UI を `features/shared/meal-editor` へ移す
- [x] `foods-search-bar.tsx` と `food-library-card.tsx` の責務を維持したまま screen を薄くする
- [x] 保存 payload の build / validate を純粋関数化する
- [x] 保存 payload / validate / feedback の単体テストを追加する
- [x] `foods` 画面の主要操作テストを追加する

### 完了条件
- [x] `foods` の screen は hook と component を接続するだけになっている
- [x] `foods` の hook は一覧、編集、解析、保存の責務に分かれている
- [x] `foods` から `features/record` を直接 import していない
- [x] 主要な純粋関数にテストがある

## 2. History

次点。すでに `hooks/`、`usecases/`、`schemas/`、`utils/` があるため、既存構造の仕上げ中心。

### 目的
- `record` と共通化できる編集 UI / 解析 UI を shared に寄せる
- 履歴固有の update / delete / save の責務境界を固定する

### チェック表
- [x] `use-history-screen.ts` が screen 接続以上の責務を持っていないか確認する
- [x] 編集フォーム状態は `use-history-meal-editor-form` に閉じる
- [x] 更新処理の純粋関数は `utils/`、通信入口は `api/`、サーバー処理は `server/` に分ける
- [x] 削除処理の純粋関数は `utils/`、通信入口は `api/`、サーバー処理は `server/` に分ける
- [x] 食品保存処理の純粋関数は `utils/`、通信入口は `api/`、サーバー処理は `server/` に分ける
- [x] 解析処理の純粋関数は `utils/`、通信入口は `api/`、サーバー処理は `server/` に分ける
- [x] 既存の `usecases/` は、複数処理を束ねる必要が残る場合だけ維持する
- [x] `history-meal-editor-panel.tsx` から shared に移せる部品を切り出す
- [x] `record` と同じ meal editor 部品を使える箇所を統一する
- [x] update / delete / save / analysis の feedback テストを追加する

### 完了条件
- [x] `history` の screen は日付選択、一覧、editor 接続だけになっている
- [x] update / delete / save / analysis の `utils/`、`api/`、`server/` 境界が分離されている
- [x] editor UI が `record` と同じ shared 境界を使っている

## 3. Settings

Foods / History の後。入力フォームは多いが、解析・編集より影響範囲は小さい。

### 目的
- 目標値、プロフィール、通知、アカウントの責務を分ける
- `use-settings-screen.ts` を screen 接続用 hook に近づける

### チェック表
- [x] `use-settings-screen.ts` の責務を棚卸しする
- [x] 手動目標フォームを `hooks/use-manual-goal-form` に分ける
- [x] 自動計算プロフィールを `hooks/use-profile-goal-form` に分ける
- [x] 通知設定を `hooks/use-notification-settings` に分ける
- [x] アカウント操作を `hooks/use-settings-account` に分ける
- [x] goal 保存 payload の build / validate を純粋関数化する
- [x] profile 保存 payload の build / validate を純粋関数化する
- [x] notification schedule の build / validate を純粋関数化する
- [x] goal / profile / notification の単体テストを追加する

### 完了条件
- [x] `settings` の screen は section component を接続するだけになっている
- [x] `use-settings-screen.ts` は各 hook の合成に近い状態になっている
- [x] 保存前の build / validate がテストされている

## 後回し

- [ ] 見た目だけの component 分割
- [ ] まだ重複していない shared 化
- [ ] 1回しか使わない薄い wrapper の追加
- [ ] 重要導線に関係しない E2E の量産

## 実行順

1. [x] Foods の feature 間依存を解消する
2. [x] Foods の巨大 hook を分割する
3. [x] Foods の editor component を分割する
4. [x] Foods の純粋関数とテストを追加する
5. [x] History の shared editor 境界を Record と揃える
6. [x] History の utils / server 境界とテストを追加する
7. [x] Settings の hook を責務別に分ける
8. [x] Settings の保存 payload / validate テストを追加する
