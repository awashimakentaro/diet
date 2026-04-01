# web/README.md

## 責務
- `web` 配下の Next.js Web アプリの起動方法、URL 構成、ディレクトリルールをまとめる。

## 使用箇所
- Web 版をローカル起動・ビルドする開発者が参照する。

## やらないこと
- モバイル版 Expo アプリの手順説明
- ドメイン仕様の完全定義

## 他ファイルとの関係
- `web/package.json` のスクリプト、`web/src/app/` の App Router 構成、`web/src/features/` 配下の機能実装と対応する。

## 起動方法

```bash
cd web
npm install
npm run dev
```

またはルートから:

```bash
npm run web:dev
```

## 画面構成

- `/` LP と使い方説明
- `/auth/login` ログイン
- `/auth/register` 新規登録
- `/setup/onboarding` 初回プロフィール設定
- `/app` Home
- `/app/record` 記録
- `/app/history` 履歴
- `/app/foods` 食品ライブラリ
- `/app/settings` 設定

## Directory Rules

### 基本方針

- `page.tsx` は route の入口に徹する。
- route 専用の薄い画面組み立ては `src/app/.../_components` に置く。
- 機能の本体ロジックと再利用 UI は `src/features` に置く。
- 機能ごとの API 呼び出し、取得、保存、更新、削除は `src/features/*/api` を参照口にする。
- アプリ全体で使う共通 UI は `src/components` に置く。
- API クライアントや認証などの基盤は `src/lib` に寄せる。

### `src/app`

- `src/app`
  Next.js App Router の URL と layout を置く。`page.tsx` はページ入口、`layout.tsx` は共通枠。
- `src/app/(public)`
  URL `/` に対応する公開導線を置く。LP のように URL にフォルダ名を出したくない公開ルートを扱う。
- `src/app/auth`
  ログイン・新規登録の route を置く。
- `src/app/setup`
  初回設定のような、本体利用前の導線を置く。
- `src/app/app`
  認証後に使う本体ルートを置く。
- `src/app/api`
  Next.js の Route Handler を置く。`route.ts` はフレームワーク上の入口だけにし、機能ごとの API 呼び出しや保存取得処理の参照口は `src/features/*/api` に寄せる。

### `src/app/.../_components`

- `src/app/.../_components`
  その route 専用の薄い UI を置く。URL 本体ではない補助コード。
- ここに置くもの
  トップバー・下部ナビ・複数 feature UI の組み立て、route ごとのレイアウト調整、route 専用の空状態や loading 表示。
- ここに置かないもの
  API 通信、永続化、業務ロジック、他 route でも再利用する UI。

### `src/features`

- `src/features`
  機能ごとにまとめる。`record`, `history`, `foods`, `settings`, `summary`, `auth` のように切る。
- `src/features/*/api`
  その機能専用の API 呼び出しを置く。取得、保存、更新、削除、再集計など、外部とのやり取りはまずここを参照口にする。
- `src/features/*/components`
  その機能の UI 本体を置く。別 route でも再利用する UI はここに残す。
- `src/features/*/use-*.ts`
  その機能専用の state 管理、画面用 hook、取得結果の整形を置く。
- `src/features/*/map-*.ts`
  DB 行や API レスポンスを画面用データへ変換する処理を置く。

### `src/components`

- `src/components`
  アプリ全体で再利用する共通 UI を置く。
- `src/components/ui`
  ボタン、ダイアログ、フォームなどの汎用 UI 部品。
- `src/components/layout`
  route をまたいで使う共通レイアウト部品。
- `src/components/error`
  汎用エラー表示や fallback UI。

### 基盤ディレクトリ

- `src/lib`
  Supabase client、認証、API クライアント、日付処理などの基盤ロジック。
- `src/config`
  `paths.ts` のような共通設定。
- `src/domain`
  ドメイン型、永続化モデルに近い型定義。
- `src/utils`
  小さい汎用 helper 関数。
- `src/hooks`
  複数 feature から再利用する custom hook。
- `src/store`
  グローバルに共有する状態管理。
- `src/data`
  mock data や初期サンプル。
- `src/styles`
  グローバルスタイル。

### 実装ルール

- `page.tsx` は薄く保つ
  中身は `src/app/.../_components` や `src/features` に寄せる。
- API 通信を component にベタ書きしない
  取得・保存処理は `src/features/*/api` か `src/lib/*` に分ける。
- 認証は `src/lib/auth.tsx` と `src/app/provider.tsx` に寄せる
  各 page や UI に直接散らさない。
- form は `react-hook-form + zod + src/components/ui/form` を基本形にする。
- サーバー状態は SWR を基本に扱う
  API データを `useState` だけで直接持ちすぎない。
- route 専用と feature 専用を混ぜない
  その URL でしか使わない薄い組み立ては `src/app/.../_components`、再利用する業務 UI は `src/features/*/components` に置く。
- export の整理が必要な feature では `index.ts` を窓口として使ってよい。
- Storybook を置く場合は `*.stories.tsx` を対象 component の近くに置く。
- テストを追加する場合は、対象の近くに `__tests__` を置く。

## 現状

- App Router の route と feature を分離し、`src/app/.../_components` と `src/features` を使い分ける構成へ移行中。
- API の参照口を `src/features/*/api` に寄せ、feature 単位で取得保存処理を整理している段階。
- Web 版は Supabase を利用した認証・保存を一部導入済みで、MVP 後の refactor を進めている段階。
