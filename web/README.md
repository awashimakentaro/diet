# web/README.md

## 責務
- `web` 配下の Next.js Web アプリの起動方法と構成意図をまとめる。

## 使用箇所
- Web 版をローカル起動・ビルドする開発者が参照する。

## やらないこと
- モバイル版 Expo アプリの手順説明
- ドメイン仕様の完全定義

## 他ファイルとの関係
- `web/package.json` のスクリプト、`web/app/` の App Router 構成、`web/src/` 配下の UI 実装と対応する。

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

- `/` 記録への導線
- `/app` 記録への互換導線
- `/record` 記録
- `/history` 履歴
- `/foods` 食品ライブラリ
- `/settings` 設定

## 現状

- 現在の Web 版は、モバイル版の情報設計を踏まえた独立 UI 実装。
- 実データ接続はまだ行わず、サンプルデータで画面導線を固める段階。
